package com.fsad.backend.controller;

import com.fsad.backend.dto.JwtResponse;
import com.fsad.backend.dto.LoginRequest;
import com.fsad.backend.dto.MessageResponse;
import com.fsad.backend.dto.SignupRequest;
import com.fsad.backend.entity.Role;
import com.fsad.backend.entity.User;
import com.fsad.backend.repository.UserRepository;
import com.fsad.backend.security.JwtUtil;
import com.fsad.backend.security.UserDetailsImpl;
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

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Email is already in use!"));
        }

        // Default role is STUDENT if none is specified or if invalid
        Role role = Role.STUDENT;
        if (signUpRequest.getRole() != null) {
            try {
                role = Role.valueOf(signUpRequest.getRole().toUpperCase());
            } catch (IllegalArgumentException e) {
                return ResponseEntity
                        .badRequest()
                        .body(new MessageResponse("Error: Invalid role specified."));
            }
        }

        // Security check: Only SUPER_ADMIN can create UNIVERSITY_ADMIN
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

            // Create new user's account
            User user = User.builder()
                    .name(signUpRequest.getName())
                    .email(signUpRequest.getEmail())
                    .password(encoder.encode(signUpRequest.getPassword()))
                    .role(role)
                    .dob(signUpRequest.getDob()) // e.g. "2005-03-21"
                    .mobileNo(signUpRequest.getMobileNo())
                    .university(university)
                    .build();

            // 1. Initial save to get the auto-generated database ID
            user = userRepository.save(user);

            // 2. Format the unique ID based on role Rules
            String uniqueId = "";
            String sequenceId = String.format("%06d", user.getId()); // 6-digit sequence

            if (role == Role.STUDENT) {
                // YYYYMM + sequence
                String dob = signUpRequest.getDob();
                String yyyy = java.time.LocalDate.now().getYear() + "";
                String mm = String.format("%02d", java.time.LocalDate.now().getMonthValue());

                if (dob != null && dob.length() >= 7) {
                    yyyy = dob.substring(0, 4);
                    mm = dob.substring(5, 7);
                }
                uniqueId = yyyy + mm + sequenceId;
            } else if (role == Role.MENTOR) {
                // YYYY + sequence + first 2 letters of name
                String yyyy = java.time.LocalDate.now().getYear() + "";
                String namePrefix = user.getName().length() >= 2 ? user.getName().substring(0, 2).toUpperCase()
                        : (user.getName() + "XX").substring(0, 2).toUpperCase();
                uniqueId = yyyy + sequenceId + namePrefix;
            } else {
                // Fallback for Admins
                uniqueId = "ADM" + sequenceId;
            }

            user.setUniqueId(uniqueId);

            // 3. Second save to persist the new uniqueId string
            userRepository.save(user);

            return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(new MessageResponse("Server Error: " + e.getMessage()));
        }
    }
}
