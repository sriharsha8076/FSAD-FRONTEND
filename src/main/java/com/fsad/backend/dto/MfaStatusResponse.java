package com.fsad.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MfaStatusResponse {
    private boolean mfaEnabled;
    private boolean mfaMandatory; // true for ADMIN / UNIVERSITY_ADMIN / SUPER_ADMIN roles
}
