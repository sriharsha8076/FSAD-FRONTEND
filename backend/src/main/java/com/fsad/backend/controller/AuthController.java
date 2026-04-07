package com.fsad.backend.controller;

import com.fsad.backend.dto.*;
import com.fsad.backend.entity.Role;
import com.fsad.backend.entity.User;
import com.fsad.backend.repository.UserRepository;
import com.fsad.backend.security.JwtUtil;
import com.fsad.backend.security.UserDetailsImpl;
import com.fsad.backend.service.EmailService;
import com.fsad.backend.service.OtpStore;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final com.fsad.backend.repository.UniversityRepository universityRepository;
    private final PasswordEncoder encoder;
    private final JwtUtil jwtUtil;
    private final OtpStore otpStore;
    private final EmailService emailService;

    // ─────────────────────────────────────────────
    // LOGIN
    // ─────────────────────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtil.generateJwtToken(authentication);

            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

            return ResponseEntity.ok(new JwtResponse(jwt,
                    userDetails.getId(),
                    userDetails.getName(),
                    userDetails.getEmail(),
                    userDetails.getAuthorities().iterator().next().getAuthority().replace("ROLE_", ""),
                    userDetails.getUniqueId(),
                    userDetails.getDob(),
                    userDetails.getMobileNo()));
        } catch (org.springframework.security.authentication.BadCredentialsException e) {
            return ResponseEntity.status(401).body(new MessageResponse("Error: Invalid email or password"));
        }
    }

    // ─────────────────────────────────────────────
    // STEP 1 — SEND OTP (validate form data, cache it, send email)
    // ─────────────────────────────────────────────
    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@Valid @RequestBody SignupRequest signupRequest) {

        // Check email uniqueness
        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: Email is already in use!"));
        }

        // Validate role
        Role role = Role.STUDENT;
        if (signupRequest.getRole() != null) {
            try {
                role = Role.valueOf(signupRequest.getRole().toUpperCase());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Error: Invalid role specified."));
            }
        }

        // Security check: Only SUPER_ADMIN can pre-register UNIVERSITY_ADMIN
        if (role == Role.UNIVERSITY_ADMIN) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            boolean isSuperAdmin = auth != null && auth.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_SUPER_ADMIN"));
            if (!isSuperAdmin) {
                return ResponseEntity.status(403)
                        .body(new MessageResponse("Error: Only Super Admin can create University Admin accounts."));
            }
        }

        try {
            // Generate OTP and cache signup data
            String otp = otpStore.generateAndStore(signupRequest.getEmail(), signupRequest);

            // Send email
            String firstName = signupRequest.getName() != null
                    ? signupRequest.getName().split(" ")[0]
                    : "User";
            emailService.sendOtpEmail(signupRequest.getEmail(), firstName, otp);

            return ResponseEntity.ok(
                    new MessageResponse("OTP sent to " + signupRequest.getEmail() + ". Please check your email."));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Failed to send OTP: " + e.getMessage()));
        }
    }

    // ─────────────────────────────────────────────
    // STEP 2 — VERIFY OTP & CREATE ACCOUNT
    // ─────────────────────────────────────────────
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtpAndRegister(@RequestBody OtpVerifyRequest verifyRequest) {

        String email = verifyRequest.getEmail();
        String otp = verifyRequest.getOtp();

        // 1. Check OTP validity
        if (!otpStore.verify(email, otp)) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: Invalid or expired OTP. Please try again."));
        }

        // 2. Retrieve cached signup data
        SignupRequest signupRequest = otpStore.getSignupData(email);
        if (signupRequest == null) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: Session expired. Please start registration again."));
        }

        // 3. Double-check email uniqueness (in case someone registered between steps)
        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            otpStore.invalidate(email);
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: Email is already in use!"));
        }

        try {
            // 4. Determine role
            Role role = Role.STUDENT;
            if (signupRequest.getRole() != null) {
                try {
                    role = Role.valueOf(signupRequest.getRole().toUpperCase());
                } catch (IllegalArgumentException ignored) {}
            }

            // 5. Resolve university if mentor
            com.fsad.backend.entity.University university = null;
            if (role == Role.MENTOR && Boolean.TRUE.equals(signupRequest.getWorksUnderUniversity())) {
                if (signupRequest.getUniversityId() == null) {
                    throw new com.fsad.backend.exception.ResourceNotFoundException(
                            "University ID is required when working under a university.");
                }
                university = universityRepository.findById(signupRequest.getUniversityId())
                        .orElseThrow(() -> new com.fsad.backend.exception.ResourceNotFoundException(
                                "University not found with ID: " + signupRequest.getUniversityId()));
            }

            // 6. Create user
            User user = User.builder()
                    .name(signupRequest.getName())
                    .email(signupRequest.getEmail())
                    .password(encoder.encode(signupRequest.getPassword()))
                    .role(role)
                    .dob(signupRequest.getDob())
                    .mobileNo(signupRequest.getMobileNo())
                    .university(university)
                    .build();

            user = userRepository.save(user);

            // 7. Generate uniqueId
            String sequenceId = String.format("%06d", user.getId());
            String uniqueId;
            if (role == Role.STUDENT) {
                String dob = signupRequest.getDob();
                String yyyy = java.time.LocalDate.now().getYear() + "";
                String mm = String.format("%02d", java.time.LocalDate.now().getMonthValue());
                if (dob != null && dob.length() >= 7) {
                    yyyy = dob.substring(0, 4);
                    mm = dob.substring(5, 7);
                }
                uniqueId = yyyy + mm + sequenceId;
            } else if (role == Role.MENTOR) {
                String yyyy = java.time.LocalDate.now().getYear() + "";
                String namePrefix = user.getName().length() >= 2
                        ? user.getName().substring(0, 2).toUpperCase()
                        : (user.getName() + "XX").substring(0, 2).toUpperCase();
                uniqueId = yyyy + sequenceId + namePrefix;
            } else {
                uniqueId = "ADM" + sequenceId;
            }

            user.setUniqueId(uniqueId);
            userRepository.save(user);

            // 8. Invalidate OTP
            otpStore.invalidate(email);

            return ResponseEntity.ok(new MessageResponse("User registered successfully! Please login."));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Server Error: " + e.getMessage()));
        }
    }

    // ─────────────────────────────────────────────
    // LEGACY REGISTER (kept for SUPER_ADMIN direct use)
    // ─────────────────────────────────────────────
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: Email is already in use!"));
        }

        Role role = Role.STUDENT;
        if (signUpRequest.getRole() != null) {
            try {
                role = Role.valueOf(signUpRequest.getRole().toUpperCase());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Error: Invalid role specified."));
            }
        }

        if (role == Role.UNIVERSITY_ADMIN) {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            boolean isSuperAdmin = authentication != null && authentication.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_SUPER_ADMIN"));
            if (!isSuperAdmin) {
                return ResponseEntity.status(403)
                        .body(new MessageResponse("Error: Only Super Admin can create University Admin accounts."));
            }
        }

        try {
            com.fsad.backend.entity.University university = null;
            if (role == Role.MENTOR && Boolean.TRUE.equals(signUpRequest.getWorksUnderUniversity())) {
                if (signUpRequest.getUniversityId() == null) {
                    throw new com.fsad.backend.exception.ResourceNotFoundException(
                            "University ID is required when working under a university.");
                }
                university = universityRepository.findById(signUpRequest.getUniversityId())
                        .orElseThrow(() -> new com.fsad.backend.exception.ResourceNotFoundException(
                                "University not found with ID: " + signUpRequest.getUniversityId()));
            }

            User user = User.builder()
                    .name(signUpRequest.getName())
                    .email(signUpRequest.getEmail())
                    .password(encoder.encode(signUpRequest.getPassword()))
                    .role(role)
                    .dob(signUpRequest.getDob())
                    .mobileNo(signUpRequest.getMobileNo())
                    .university(university)
                    .build();

            user = userRepository.save(user);

            String uniqueId;
            String sequenceId = String.format("%06d", user.getId());
            if (role == Role.STUDENT) {
                String dob = signUpRequest.getDob();
                String yyyy = java.time.LocalDate.now().getYear() + "";
                String mm = String.format("%02d", java.time.LocalDate.now().getMonthValue());
                if (dob != null && dob.length() >= 7) {
                    yyyy = dob.substring(0, 4);
                    mm = dob.substring(5, 7);
                }
                uniqueId = yyyy + mm + sequenceId;
            } else if (role == Role.MENTOR) {
                String yyyy = java.time.LocalDate.now().getYear() + "";
                String namePrefix = user.getName().length() >= 2
                        ? user.getName().substring(0, 2).toUpperCase()
                        : (user.getName() + "XX").substring(0, 2).toUpperCase();
                uniqueId = yyyy + sequenceId + namePrefix;
            } else {
                uniqueId = "ADM" + sequenceId;
            }

            user.setUniqueId(uniqueId);
            userRepository.save(user);

            return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(new MessageResponse("Server Error: " + e.getMessage()));
        }
    }
}
