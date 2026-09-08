package com.homestaybooking.service;

import com.homestaybooking.dto.request.UpdateProfileRequest;
import com.homestaybooking.dto.response.UserProfileResponse;
import com.homestaybooking.entity.User;
import com.homestaybooking.exception.AppException;
import com.homestaybooking.repository.UserRepository;
import com.homestaybooking.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
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


    public UserProfileResponse updateMyProfile(String authorizationHeader, UpdateProfileRequest request) {
        if (request == null) {
            throw new AppException("Dữ liệu hồ sơ không hợp lệ");
        }

        User user = getCurrentUser(authorizationHeader);
        String fullName = trimToNull(request.getFullName());
        if (fullName == null || fullName.length() < 2) {
            throw new AppException("Họ và tên cần ít nhất 2 ký tự");
        }
        if (request.getBirthday() != null && request.getBirthday().isAfter(LocalDate.now())) {
            throw new AppException("Ngày sinh trong hồ sơ không hợp lệ");
        }

        user.setFullName(fullName);
        user.setPhoneNumber(trimToNull(request.getPhoneNumber()));
        user.setBirthday(request.getBirthday());
        user.setGender(trimToNull(request.getGender()));
        user.setAddress(trimToNull(request.getAddress()));
        user.setUpdatedAt(LocalDateTime.now());

        return toResponse(userRepository.save(user));
    }
    public UserProfileResponse updateMyAvatar(String authorizationHeader, String avatar) {
        User user = getCurrentUser(authorizationHeader);
        String normalizedAvatar = avatar == null ? null : avatar.trim();

        if (normalizedAvatar != null && normalizedAvatar.length() > 1_000_000) {
            throw new AppException("Ảnh avatar quá lớn. Vui lòng chọn ảnh nhỏ hơn.");
        }

        user.setAvatar(normalizedAvatar == null || normalizedAvatar.isBlank() ? null : normalizedAvatar);
        user.setUpdatedAt(LocalDateTime.now());
        return toResponse(userRepository.save(user));
    }

    private User getCurrentUser(String authorizationHeader) {
        String email = jwtUtil.extractEmailFromAuthorizationHeader(authorizationHeader);
        if (email == null || email.isBlank()) {
            throw new AppException("Bạn cần đăng nhập để cập nhật hồ sơ");
        }
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException("Không tìm thấy tài khoản đang đăng nhập"));
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
    private UserProfileResponse toResponse(User user) {
        return UserProfileResponse.builder()
                .userId(user.getUserId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .birthday(user.getBirthday())
                .address(user.getAddress())
                .gender(user.getGender())
                .avatar(user.getAvatar())
                .roleName(user.getRole() == null ? null : user.getRole().getRoleName())
                .build();
    }
}
