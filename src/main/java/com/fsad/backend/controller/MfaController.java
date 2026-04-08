package com.fsad.backend.controller;

import com.fsad.backend.dto.*;
import com.fsad.backend.entity.User;
import com.fsad.backend.repository.UserRepository;
import com.fsad.backend.security.JwtUtil;
import com.fsad.backend.service.MfaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/mfa")
@RequiredArgsConstructor
public class MfaController {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final MfaService mfaService;

    // Simple in-memory rate limiter: email → consecutive failures
    private final ConcurrentHashMap<String, AtomicInteger> failureCount = new ConcurrentHashMap<>();
    private static final int MAX_FAILURES = 5;

    // ─── 1. GET MFA STATUS ────────────────────────────────────────────────
    @GetMapping("/status")
    public ResponseEntity<?> getMfaStatus(Authentication authentication) {
        User user = resolveUser(authentication);
        boolean mandatory = mfaService.isMfaMandatoryForRole(
                authentication.getAuthorities().iterator().next().getAuthority());
        return ResponseEntity.ok(new MfaStatusResponse(user.isMfaEnabled(), mandatory));
    }

    // ─── 2. SETUP — Generate secret + QR code ─────────────────────────────
    @PostMapping("/setup")
    public ResponseEntity<?> setupMfa(Authentication authentication) {
        User user = resolveUser(authentication);

        if (user.isMfaEnabled()) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("MFA is already enabled. Disable it first to regenerate."));
        }

        String rawSecret = mfaService.generateSecret();
        String encryptedSecret = mfaService.encryptSecret(rawSecret);

        // Store temporarily (not yet activated — activated only after verify-setup)
        user.setMfaSecret(encryptedSecret);
        userRepository.save(user);

        String otpauthUrl = mfaService.getOtpauthUrl(user.getEmail(), rawSecret);
        String qrBase64 = mfaService.generateQrCodeBase64(otpauthUrl);

        return ResponseEntity.ok(new MfaSetupResponse(rawSecret, qrBase64, otpauthUrl));
    }

    // ─── 3. VERIFY SETUP — Confirm first TOTP code and activate MFA ───────
    @PostMapping("/verify-setup")
    public ResponseEntity<?> verifySetup(Authentication authentication,
                                         @RequestBody MfaVerifyRequest request) {
        User user = resolveUser(authentication);

        if (user.getMfaSecret() == null) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("No MFA setup in progress. Call /api/mfa/setup first."));
        }

        if (!mfaService.verifyTotp(user.getMfaSecret(), request.getCode())) {
            return ResponseEntity.status(400)
                    .body(new MessageResponse("Invalid TOTP code. Please try again."));
        }

        // Activate MFA
        user.setMfaEnabled(true);
        user.setLastMfaVerified(LocalDateTime.now());
        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("MFA enabled successfully! Your account is now protected."));
    }

    // ─── 4. VERIFY — During login (accepts preAuthToken) ─────────────────
    @PostMapping("/verify")
    public ResponseEntity<?> verifyMfaLogin(@RequestBody MfaVerifyRequest request) {
        String preAuthToken = request.getPreAuthToken();

        if (preAuthToken == null || preAuthToken.isBlank()) {
            return ResponseEntity.status(401)
                    .body(new MessageResponse("Pre-auth token is required."));
        }

        if (!jwtUtil.validateJwtToken(preAuthToken) || !jwtUtil.isPreAuthToken(preAuthToken)) {
            return ResponseEntity.status(401)
                    .body(new MessageResponse("Invalid or expired pre-auth token. Please login again."));
        }

        String email = jwtUtil.getUserNameFromJwtToken(preAuthToken);

        // Rate limit check
        if (isRateLimited(email)) {
            return ResponseEntity.status(429)
                    .body(new MessageResponse("Too many failed attempts. Please wait before trying again."));
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.isMfaEnabled() || user.getMfaSecret() == null) {
            return ResponseEntity.status(400)
                    .body(new MessageResponse("MFA is not enabled for this account."));
        }

        if (!mfaService.verifyTotp(user.getMfaSecret(), request.getCode())) {
            recordFailure(email);
            return ResponseEntity.status(400)
                    .body(new MessageResponse("Invalid TOTP code. Please try again."));
        }

        // Success — clear failures, update timestamp, issue full JWT
        clearFailures(email);
        user.setLastMfaVerified(LocalDateTime.now());
        userRepository.save(user);

        String fullToken = jwtUtil.generateMfaVerifiedToken(email);

        // Build full user response
        return ResponseEntity.ok(Map.of(
                "token", fullToken,
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "role", user.getRole().name(),
                "uniqueId", user.getUniqueId() != null ? user.getUniqueId() : "",
                "dob", user.getDob() != null ? user.getDob() : "",
                "mobileNo", user.getMobileNo() != null ? user.getMobileNo() : "",
                "mfaEnabled", true,
                "mfaVerifiedAt", System.currentTimeMillis()
        ));
    }

    // ─── 5. REVERIFY — 30-min re-authentication ───────────────────────────
    @PostMapping("/reverify")
    public ResponseEntity<?> reverifyMfa(Authentication authentication,
                                          @RequestBody MfaVerifyRequest request) {
        User user = resolveUser(authentication);
        String email = user.getEmail();

        if (!user.isMfaEnabled() || user.getMfaSecret() == null) {
            return ResponseEntity.status(400)
                    .body(new MessageResponse("MFA is not enabled for this account."));
        }

        // Rate limit check
        if (isRateLimited(email)) {
            return ResponseEntity.status(429)
                    .body(new MessageResponse("Too many failed attempts. Please wait before trying again."));
        }

        if (!mfaService.verifyTotp(user.getMfaSecret(), request.getCode())) {
            recordFailure(email);
            return ResponseEntity.status(400)
                    .body(new MessageResponse("Invalid TOTP code. Please try again."));
        }

        // Success
        clearFailures(email);
        user.setLastMfaVerified(LocalDateTime.now());
        userRepository.save(user);

        String newToken = jwtUtil.generateMfaVerifiedToken(email);
        return ResponseEntity.ok(Map.of(
                "token", newToken,
                "mfaVerifiedAt", System.currentTimeMillis(),
                "message", "MFA re-verified successfully."
        ));
    }

    // ─── 6. DISABLE MFA ──────────────────────────────────────────────────
    @PostMapping("/disable")
    public ResponseEntity<?> disableMfa(Authentication authentication,
                                         @RequestBody MfaVerifyRequest request) {
        User user = resolveUser(authentication);
        String role = authentication.getAuthorities().iterator().next().getAuthority();

        if (mfaService.isMfaMandatoryForRole(role)) {
            return ResponseEntity.status(403)
                    .body(new MessageResponse("MFA cannot be disabled for admin accounts. It is mandatory for your role."));
        }

        if (!user.isMfaEnabled()) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("MFA is not enabled on this account."));
        }

        // Require current TOTP code to disable (security check)
        if (!mfaService.verifyTotp(user.getMfaSecret(), request.getCode())) {
            return ResponseEntity.status(400)
                    .body(new MessageResponse("Invalid TOTP code. Provide your current authenticator code to disable MFA."));
        }

        user.setMfaEnabled(false);
        user.setMfaSecret(null);
        user.setLastMfaVerified(null);
        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("MFA has been disabled successfully."));
    }

    // ─── Helpers ─────────────────────────────────────────────────────────

    private User resolveUser(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found in database"));
    }

    private boolean isRateLimited(String email) {
        AtomicInteger failures = failureCount.get(email);
        return failures != null && failures.get() >= MAX_FAILURES;
    }

    private void recordFailure(String email) {
        failureCount.computeIfAbsent(email, k -> new AtomicInteger(0)).incrementAndGet();
    }

    private void clearFailures(String email) {
        failureCount.remove(email);
    }
}
