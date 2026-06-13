package com.homestaybooking.service;

import com.homestaybooking.dto.request.LoginRequest;
import com.homestaybooking.dto.request.RegisterRequest;
import com.homestaybooking.dto.response.AuthResponse;
import com.homestaybooking.entity.Role;
import com.homestaybooking.entity.User;
import com.homestaybooking.exception.AppException;
import com.homestaybooking.repository.RoleRepository;
import com.homestaybooking.repository.UserRepository;
import com.homestaybooking.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException("Email đã tồn tại");
        }

        String roleName = request.getRoleName();

        if (roleName == null || roleName.isBlank()) {
            roleName = "CUSTOMER";
        }

        final String normalizedRoleName = roleName.toUpperCase();

        if (!normalizedRoleName.equals("CUSTOMER") && !normalizedRoleName.equals("HOST")) {
            throw new AppException("Vai trò không hợp lệ");
        }

        Role role = roleRepository.findByRoleName(normalizedRoleName)
                .orElseThrow(() -> new AppException("Role chưa tồn tại trong database: " + normalizedRoleName));

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phoneNumber(request.getPhoneNumber())
                .role(role)
                .userStatus("ACTIVE")
                .build();

        User savedUser = userRepository.save(user);

        String token = jwtUtil.generateToken(savedUser.getEmail(), role.getRoleName());

        return AuthResponse.builder()
                .userId(savedUser.getUserId())
                .fullName(savedUser.getFullName())
                .email(savedUser.getEmail())
                .roleName(role.getRoleName())
                .token(token)
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException("Email không tồn tại"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new AppException("Mật khẩu không đúng");
        }

        if (!"ACTIVE".equals(user.getUserStatus())) {
            throw new AppException("Tài khoản đã bị khóa hoặc không hoạt động");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().getRoleName());

        return AuthResponse.builder()
                .userId(user.getUserId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .roleName(user.getRole().getRoleName())
                .token(token)
                .build();
    }
}