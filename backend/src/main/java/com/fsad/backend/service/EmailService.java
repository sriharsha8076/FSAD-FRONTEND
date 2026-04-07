package com.fsad.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class EmailService {

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${BREVO_API_KEY:}")
    private String brevoApiKey;

    public void sendOtpEmail(String toEmail, String userName, String otp) {
        if (brevoApiKey == null || brevoApiKey.isEmpty()) {
            throw new RuntimeException("BREVO_API_KEY is not configured.");
        }

        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("api-key", brevoApiKey);

            String htmlContent = buildOtpEmailHtml(userName, otp);

            Map<String, Object> body = new HashMap<>();
            
            Map<String, String> sender = new HashMap<>();
            sender.put("name", "SAAMS Portal");
            sender.put("email", fromEmail);
            body.put("sender", sender);

            Map<String, String> to = new HashMap<>();
            to.put("email", toEmail);
            to.put("name", userName);
            body.put("to", List.of(to));

            body.put("subject", "🔐 Your SAAMS Registration OTP");
            body.put("htmlContent", htmlContent);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            
            ResponseEntity<String> response = restTemplate.postForEntity(
                "https://api.brevo.com/v3/smtp/email", 
                request, 
                String.class
            );

            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new RuntimeException("Brevo API returned error: " + response.getBody());
            }

        } catch (Exception e) {
            throw new RuntimeException("Failed to send OTP email via API: " + e.getMessage(), e);
        }
    }

    private String buildOtpEmailHtml(String userName, String otp) {
        // Split OTP into individual digits for the styled boxes
        StringBuilder digitBoxes = new StringBuilder();
        for (char c : otp.toCharArray()) {
            digitBoxes.append(
                "<td style=\"padding: 0 6px;\">" +
                "<div style=\"width:48px;height:56px;background:#1e293b;border:2px solid #6366f1;" +
                "border-radius:12px;display:flex;align-items:center;justify-content:center;" +
                "font-size:28px;font-weight:700;color:#6366f1;text-align:center;" +
                "line-height:56px;font-family:monospace;\">" + c + "</div>" +
                "</td>"
            );
        }

        return "<!DOCTYPE html>" +
            "<html><head><meta charset='UTF-8'></head><body style='margin:0;padding:0;" +
            "background:#0f172a;font-family:Inter,Arial,sans-serif;'>" +
            "<table width='100%' cellpadding='0' cellspacing='0' style='background:#0f172a;padding:40px 0;'>" +
            "<tr><td align='center'>" +
            "<table width='560' cellpadding='0' cellspacing='0' style='background:#1e293b;" +
            "border-radius:20px;overflow:hidden;border:1px solid #334155;'>" +

            // Header
            "<tr><td style='background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:36px 40px;text-align:center;'>" +
            "<div style='font-size:40px;margin-bottom:12px;'>🎓</div>" +
            "<h1 style='color:#fff;margin:0;font-size:26px;font-weight:700;letter-spacing:-0.5px;'>SAAMS Portal</h1>" +
            "<p style='color:#c4b5fd;margin:6px 0 0;font-size:14px;'>Smart Academic Achievement Management System</p>" +
            "</td></tr>" +

            // Body
            "<tr><td style='padding:40px 40px 20px;'>" +
            "<p style='color:#94a3b8;font-size:15px;margin:0 0 8px;'>Hello, <strong style='color:#e2e8f0;'>" + userName + "</strong> 👋</p>" +
            "<p style='color:#94a3b8;font-size:15px;margin:0 0 32px;'>Use the OTP below to complete your registration. " +
            "It expires in <strong style='color:#f59e0b;'>5 minutes</strong>.</p>" +

            // OTP Boxes
            "<table cellpadding='0' cellspacing='0' style='margin:0 auto 32px;'><tr>" +
            digitBoxes.toString() +
            "</tr></table>" +

            "<div style='background:#0f172a;border:1px solid #334155;border-radius:12px;padding:16px 20px;" +
            "margin-bottom:28px;text-align:center;'>" +
            "<p style='color:#64748b;font-size:12px;margin:0 0 4px;text-transform:uppercase;letter-spacing:1px;'>Your OTP Code</p>" +
            "<p style='color:#6366f1;font-size:32px;font-weight:700;letter-spacing:8px;margin:0;font-family:monospace;'>" + otp + "</p>" +
            "</div>" +

            "<div style='background:#0f172a;border-left:4px solid #f59e0b;border-radius:0 8px 8px 0;" +
            "padding:14px 16px;margin-bottom:28px;'>" +
            "<p style='color:#fbbf24;font-size:13px;margin:0;'>⚠️ Do not share this OTP with anyone. " +
            "SAAMS will never ask for your OTP.</p>" +
            "</div>" +
            "</td></tr>" +

            // Footer
            "<tr><td style='background:#0f172a;padding:24px 40px;text-align:center;" +
            "border-top:1px solid #1e293b;'>" +
            "<p style='color:#475569;font-size:12px;margin:0;'>© 2024 SAAMS · Smart Academic Achievement Management System</p>" +
            "<p style='color:#334155;font-size:11px;margin:8px 0 0;'>If you did not request this, please ignore this email.</p>" +
            "</td></tr>" +

            "</table></td></tr></table></body></html>";
    }
}
