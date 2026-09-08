package com.homestaybooking.service;

import com.homestaybooking.entity.User;
import com.homestaybooking.exception.AppException;
import com.homestaybooking.repository.UserRepository;
import com.homestaybooking.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Locale;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class RevenueAccessService {
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public User requireUser(String authorizationHeader) {
        String email = jwtUtil.extractEmailFromAuthorizationHeader(authorizationHeader);
        if (email == null) throw new AppException("AUTH_REQUIRED");
        return userRepository.findByEmail(email).orElseThrow(() -> new AppException("USER_NOT_FOUND"));
    }

    public User requireAdmin(String authorizationHeader) {
        User user = requireUser(authorizationHeader);
        requireRole(user, Set.of("ADMIN"));
        return user;
    }

    public User requireHost(String authorizationHeader) {
        User user = requireUser(authorizationHeader);
        requireRole(user, Set.of("HOST", "ADMIN"));
        return user;
    }

    private void requireRole(User user, Set<String> roles) {
        String roleName = user.getRole() == null ? "" : user.getRole().getRoleName();
        if (!roles.contains(roleName == null ? "" : roleName.toUpperCase(Locale.ROOT))) {
            throw new AppException("FORBIDDEN_REVENUE_ACCESS");
        }
    }
}
