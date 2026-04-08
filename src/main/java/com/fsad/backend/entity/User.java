package com.fsad.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    // Optional fields for profile
    private String uniqueId; // E.g., MEN2024003 or 2602000015
    private String dob;
    private String mobileNo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "university_id", nullable = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private University university;

    private String bio;

    // ─── MFA Fields ───────────────────────────────
    @Builder.Default
    @Column(name = "mfa_enabled", nullable = false)
    private boolean mfaEnabled = false;

    @Column(name = "mfa_secret", length = 512)
    private String mfaSecret; // AES-256 encrypted TOTP secret

    @Column(name = "last_mfa_verified")
    private LocalDateTime lastMfaVerified;
}
