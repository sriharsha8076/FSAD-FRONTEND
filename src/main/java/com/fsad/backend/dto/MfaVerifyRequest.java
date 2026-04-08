package com.fsad.backend.dto;

import lombok.Data;

@Data
public class MfaVerifyRequest {
    private String code;           // 6-digit TOTP code
    private String preAuthToken;   // used during login MFA step (may be null for reverify)
}
