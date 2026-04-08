package com.fsad.backend.service;

import com.fsad.backend.dto.SignupRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class OtpStore {

    @Value("${otp.expiry-minutes:5}")
    private int expiryMinutes;

    private static class OtpEntry {
        final String otp;
        final LocalDateTime expiry;
        final SignupRequest signupData;

        OtpEntry(String otp, LocalDateTime expiry, SignupRequest signupData) {
            this.otp = otp;
            this.expiry = expiry;
            this.signupData = signupData;
        }
    }

    private final Map<String, OtpEntry> store = new ConcurrentHashMap<>();
    private final SecureRandom secureRandom = new SecureRandom();

    /**
     * Generates a 6-digit OTP, stores it with the signup data, and returns the OTP string.
     */
    public String generateAndStore(String email, SignupRequest signupData) {
        int raw = secureRandom.nextInt(900000) + 100000; // 100000 – 999999
        String otp = String.valueOf(raw);
        LocalDateTime expiry = LocalDateTime.now().plusMinutes(expiryMinutes);
        store.put(email.toLowerCase(), new OtpEntry(otp, expiry, signupData));
        return otp;
    }

    /**
     * Returns true if the OTP matches and has not expired. Does NOT consume the OTP.
     */
    public boolean verify(String email, String otp) {
        OtpEntry entry = store.get(email.toLowerCase());
        if (entry == null) return false;
        if (LocalDateTime.now().isAfter(entry.expiry)) {
            store.remove(email.toLowerCase());
            return false;
        }
        return entry.otp.equals(otp);
    }

    /**
     * Retrieves the stored signup data for a given email (after OTP verification).
     */
    public SignupRequest getSignupData(String email) {
        OtpEntry entry = store.get(email.toLowerCase());
        return entry != null ? entry.signupData : null;
    }

    /**
     * Removes the OTP entry (call after successful account creation).
     */
    public void invalidate(String email) {
        store.remove(email.toLowerCase());
    }

    /**
     * Checks if there is a pending (non-expired) OTP for the given email.
     */
    public boolean hasPending(String email) {
        OtpEntry entry = store.get(email.toLowerCase());
        if (entry == null) return false;
        if (LocalDateTime.now().isAfter(entry.expiry)) {
            store.remove(email.toLowerCase());
            return false;
        }
        return true;
    }
}
