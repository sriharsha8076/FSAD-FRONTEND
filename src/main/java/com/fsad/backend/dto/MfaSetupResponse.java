package com.fsad.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MfaSetupResponse {
    private String secret;       // raw secret (shown once, for manual entry)
    private String qrCodeBase64; // base64-encoded QR code PNG image
    private String otpauthUrl;   // otpauth URI for manual entry
}
