package com.homestaybooking.service;

import com.homestaybooking.dto.response.UserProfileResponse;
import com.homestaybooking.entity.User;
import com.homestaybooking.exception.AppException;
import com.homestaybooking.repository.UserRepository;
import com.homestaybooking.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class UserProfileService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public UserProfileResponse getMyProfile(String authorizationHeader) {
        User user = getCurrentUser(authorizationHeader);
        return toResponse(user);
    }

    public UserProfileResponse updateMyAvatar(String authorizationHeader, String avatar) {
        User user = getCurrentUser(authorizationHeader);
        String normalizedAvatar = avatar == null ? null : avatar.trim();

        if (normalizedAvatar != null && normalizedAvatar.length() > 1_000_000) {
            throw new AppException("\u1ea2nh avatar qu\u00e1 l\u1edbn. Vui l\u00f2ng ch\u1ecdn \u1ea3nh nh\u1ecf h\u01a1n.");
        }

        user.setAvatar(normalizedAvatar == null || normalizedAvatar.isBlank() ? null : normalizedAvatar);
        user.setUpdatedAt(LocalDateTime.now());
        return toResponse(userRepository.save(user));
    }

    private User getCurrentUser(String authorizationHeader) {
        String email = jwtUtil.extractEmailFromAuthorizationHeader(authorizationHeader);
        if (email == null || email.isBlank()) {
            throw new AppException("B\u1ea1n c\u1ea7n \u0111\u0103ng nh\u1eadp \u0111\u1ec3 c\u1eadp nh\u1eadt h\u1ed3 s\u01a1");
        }
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException("Kh\u00f4ng t\u00ecm th\u1ea5y t\u00e0i kho\u1ea3n \u0111ang \u0111\u0103ng nh\u1eadp"));
    }

    private UserProfileResponse toResponse(User user) {
        return UserProfileResponse.builder()
                .userId(user.getUserId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .address(user.getAddress())
                .gender(user.getGender())
                .avatar(user.getAvatar())
                .roleName(user.getRole() == null ? null : user.getRole().getRoleName())
                .build();
    }
}
