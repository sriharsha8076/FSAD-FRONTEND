package com.fsad.backend.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    private static final Logger logger = LoggerFactory.getLogger(JwtUtil.class);

    // 5 minutes for pre-auth token (used between password check and MFA verify)
    private static final long PRE_AUTH_EXPIRATION_MS = 5 * 60 * 1000L;

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private int jwtExpirationMs;

    // ─── Standard token (for non-MFA users or after full login) ───────────
    public String generateJwtToken(Authentication authentication) {
        UserDetailsImpl userPrincipal = (UserDetailsImpl) authentication.getPrincipal();
        return buildToken(userPrincipal.getUsername(), false, false, jwtExpirationMs);
    }

    // ─── Full token after MFA verification ────────────────────────────────
    public String generateMfaVerifiedToken(String email) {
        return Jwts.builder()
                .setSubject(email)
                .claim("mfa_verified", true)
                .claim("mfa_verified_at", System.currentTimeMillis())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(key(), SignatureAlgorithm.HS256)
                .compact();
    }

    // ─── Short-lived pre-auth token (valid for 5 min, pending MFA step) ───
    public String generatePreAuthToken(String email) {
        return Jwts.builder()
                .setSubject(email)
                .claim("pre_auth", true)
                .claim("mfa_verified", false)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + PRE_AUTH_EXPIRATION_MS))
                .signWith(key(), SignatureAlgorithm.HS256)
                .compact();
    }

    // ─── Claims helpers ───────────────────────────────────────────────────

    public String getUserNameFromJwtToken(String token) {
        return parseClaims(token).getSubject();
    }

    public boolean isMfaVerified(String token) {
        try {
            Claims claims = parseClaims(token);
            Boolean flag = claims.get("mfa_verified", Boolean.class);
            return Boolean.TRUE.equals(flag);
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isPreAuthToken(String token) {
        try {
            Claims claims = parseClaims(token);
            Boolean flag = claims.get("pre_auth", Boolean.class);
            return Boolean.TRUE.equals(flag);
        } catch (Exception e) {
            return false;
        }
    }

    public Long getMfaVerifiedAt(String token) {
        try {
            Claims claims = parseClaims(token);
            return claims.get("mfa_verified_at", Long.class);
        } catch (Exception e) {
            return null;
        }
    }

    // ─── Validation ───────────────────────────────────────────────────────

    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parserBuilder().setSigningKey(key()).build().parse(authToken);
            return true;
        } catch (MalformedJwtException e) {
            logger.error("Invalid JWT token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            logger.error("JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            logger.error("JWT token is unsupported: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.error("JWT claims string is empty: {}", e.getMessage());
        }
        return false;
    }

    // ─── Internals ────────────────────────────────────────────────────────

    private String buildToken(String subject, boolean preAuth, boolean mfaVerified, long expirationMs) {
        return Jwts.builder()
                .setSubject(subject)
                .claim("pre_auth", preAuth)
                .claim("mfa_verified", mfaVerified)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(key(), SignatureAlgorithm.HS256)
                .compact();
    }

    private Claims parseClaims(String token) {
        return Jwts.parserBuilder().setSigningKey(key()).build()
                .parseClaimsJws(token).getBody();
    }

    private Key key() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret));
    }
}
