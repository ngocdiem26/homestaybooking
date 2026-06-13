package com.homestaybooking.service;

import com.homestaybooking.dto.request.UpdateUserRoleRequest;
import com.homestaybooking.dto.request.UpdateUserStatusRequest;
import com.homestaybooking.dto.response.AdminUserResponse;
import com.homestaybooking.entity.Role;
import com.homestaybooking.entity.User;
import com.homestaybooking.exception.AppException;
import com.homestaybooking.repository.RoleRepository;
import com.homestaybooking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    public List<AdminUserResponse> getUsers() {
        return userRepository.findAll().stream()
                .sorted(Comparator.comparing(User::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::toResponse)
                .toList();
    }

    public AdminUserResponse updateStatus(Integer userId, UpdateUserStatusRequest request) {
        User user = getUser(userId);
        String status = normalizeStatus(request.getUserStatus());

        user.setUserStatus(status);
        return toResponse(userRepository.save(user));
    }

    public AdminUserResponse updateRole(Integer userId, UpdateUserRoleRequest request) {
        User user = getUser(userId);
        String roleName = normalizeRole(request.getRoleName());

        Role role = roleRepository.findByRoleName(roleName)
                .orElseThrow(() -> new AppException("Role không tồn tại: " + roleName));

        user.setRole(role);
        return toResponse(userRepository.save(user));
    }

    private User getUser(Integer userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new AppException("Không tìm thấy người dùng"));
    }

    private String normalizeStatus(String status) {
        String normalizedStatus = status == null ? "" : status.trim().toUpperCase();

        if (!normalizedStatus.equals("ACTIVE") && !normalizedStatus.equals("BLOCKED")) {
            throw new AppException("Trạng thái không hợp lệ");
        }

        return normalizedStatus;
    }

    private String normalizeRole(String roleName) {
        String normalizedRole = roleName == null ? "" : roleName.trim().toUpperCase();

        if (!normalizedRole.equals("ADMIN") && !normalizedRole.equals("CUSTOMER") && !normalizedRole.equals("HOST")) {
            throw new AppException("Vai trò không hợp lệ");
        }

        return normalizedRole;
    }

    private AdminUserResponse toResponse(User user) {
        return AdminUserResponse.builder()
                .userId(user.getUserId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .address(user.getAddress())
                .birthday(user.getBirthday())
                .gender(user.getGender())
                .userStatus(user.getUserStatus())
                .avatar(user.getAvatar())
                .roleName(user.getRole().getRoleName())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
