package com.homestaybooking.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {

    private static final String SECRET =
            "homestaybooking_secret_key_very_long_for_jwt_token_123456789";

    private static final long EXPIRATION = 24 * 60 * 60 * 1000;

    private SecretKey getSignKey() {
        return Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(String email, String roleName) {
        return Jwts.builder()
                .subject(email)
                .claim("role", roleName)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION))
                .signWith(getSignKey())
                .compact();
    }

    public String extractEmail(String token) {
        return Jwts.parser()
                .verifyWith(getSignKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    public String extractEmailFromAuthorizationHeader(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            return null;
        }

        String token = authorizationHeader.substring(7).trim();
        if (token.isEmpty()) {
            return null;
        }

        try {
            return extractEmail(token);
        } catch (RuntimeException exception) {
            return null;
        }
    }
}
