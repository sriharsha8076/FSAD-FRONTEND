package com.fsad.backend.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.MultiFormatWriter;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.warrenstrange.googleauth.GoogleAuthenticator;
import com.warrenstrange.googleauth.GoogleAuthenticatorKey;
import com.warrenstrange.googleauth.GoogleAuthenticatorQRGenerator;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import javax.imageio.ImageIO;

@Service
public class MfaService {

    private static final String APP_NAME = "SAAMS";
    private static final int QR_SIZE = 300;

    @Value("${mfa.encryption.key}")
    private String encryptionKey;

    private final GoogleAuthenticator gAuth = new GoogleAuthenticator();

    // ─── Secret Generation ─────────────────────────────────

    /**
     * Generates a new TOTP secret key (raw, unencrypted).
     */
    public String generateSecret() {
        GoogleAuthenticatorKey credentials = gAuth.createCredentials();
        return credentials.getKey();
    }

    /**
     * Builds the otpauth:// URI for QR code / manual entry.
     */
    public String getOtpauthUrl(String userEmail, String rawSecret) {
        return GoogleAuthenticatorQRGenerator.getOtpAuthTotpURL(APP_NAME, userEmail, 
                new GoogleAuthenticatorKey.Builder(rawSecret).build());
    }

    /**
     * Generates a Base64-encoded PNG QR code image from an otpauth URL.
     */
    public String generateQrCodeBase64(String otpauthUrl) {
        try {
            Map<EncodeHintType, Object> hints = new HashMap<>();
            hints.put(EncodeHintType.MARGIN, 1);
            hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");

            BitMatrix matrix = new MultiFormatWriter().encode(
                    otpauthUrl, BarcodeFormat.QR_CODE, QR_SIZE, QR_SIZE, hints);

            BufferedImage image = MatrixToImageWriter.toBufferedImage(matrix);
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(image, "PNG", baos);
            return "data:image/png;base64," + Base64.getEncoder().encodeToString(baos.toByteArray());
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate QR code: " + e.getMessage(), e);
        }
    }

    // ─── TOTP Verification ─────────────────────────────────

    /**
     * Verifies a 6-digit TOTP code against the encrypted secret.
     */
    public boolean verifyTotp(String encryptedSecret, String code) {
        try {
            int intCode = Integer.parseInt(code.trim());
            String rawSecret = decryptSecret(encryptedSecret);
            int expected = gAuth.getTotpPassword(rawSecret); System.out.println("DEBUG MFA: rawSecret=" + rawSecret + " | code=" + intCode + " | expectedCode=" + expected); return gAuth.authorize(rawSecret, intCode);
        } catch (NumberFormatException e) {
            return false;
        }
    }

    // ─── AES Encryption / Decryption ───────────────────────

    /**
     * Encrypts a TOTP secret using AES-128 (derived from the 32-char key).
     */
    public String encryptSecret(String rawSecret) {
        try {
            SecretKeySpec keySpec = buildKeySpec();
            Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");
            cipher.init(Cipher.ENCRYPT_MODE, keySpec);
            byte[] encrypted = cipher.doFinal(rawSecret.getBytes("UTF-8"));
            return Base64.getEncoder().encodeToString(encrypted);
        } catch (Exception e) {
            throw new RuntimeException("MFA secret encryption failed", e);
        }
    }

    /**
     * Decrypts a stored encrypted TOTP secret.
     */
    public String decryptSecret(String encryptedSecret) {
        try {
            SecretKeySpec keySpec = buildKeySpec();
            Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");
            cipher.init(Cipher.DECRYPT_MODE, keySpec);
            byte[] decoded = Base64.getDecoder().decode(encryptedSecret);
            return new String(cipher.doFinal(decoded), "UTF-8");
        } catch (Exception e) {
            throw new RuntimeException("MFA secret decryption failed", e);
        }
    }

    private SecretKeySpec buildKeySpec() {
        // Use exactly 16 bytes of the key for AES-128
        byte[] keyBytes = encryptionKey.substring(0, 16).getBytes();
        return new SecretKeySpec(keyBytes, "AES");
    }

    // ─── Role Helpers ──────────────────────────────────────

    /**
     * Returns true if the given role requires mandatory MFA.
     */
    public boolean isMfaMandatoryForRole(String role) {
        if (role == null) return false;
        String r = role.toUpperCase().replace("ROLE_", "");
        return r.equals("UNIVERSITY_ADMIN") || r.equals("SUPER_ADMIN") || r.equals("ADMIN");
    }
}
