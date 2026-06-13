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
}