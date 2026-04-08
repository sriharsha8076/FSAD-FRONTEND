package com.fsad.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SignupRequest {
    @NotBlank
    private String name;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String password;

    private String role; // "STUDENT", "MENTOR", etc.

    private String dob;
    private String mobileNo;

    private Boolean worksUnderUniversity;
    private Long universityId;
}
