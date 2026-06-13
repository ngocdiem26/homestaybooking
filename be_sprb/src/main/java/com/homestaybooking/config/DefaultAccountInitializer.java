package com.homestaybooking.config;

import com.homestaybooking.entity.Role;
import com.homestaybooking.entity.User;
import com.homestaybooking.repository.RoleRepository;
import com.homestaybooking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class DefaultAccountInitializer {

    private static final String DEFAULT_ADMIN_EMAIL = "admin@gmail.com";
    private static final String DEFAULT_ADMIN_PASSWORD = "Admin@123";

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner seedDefaultAccounts() {
        return args -> {
            Role adminRole = getOrCreateRole("ADMIN", "Quản trị viên hệ thống");
            getOrCreateRole("CUSTOMER", "Khách hàng đặt homestay");
            getOrCreateRole("HOST", "Chủ homestay");

            if (!userRepository.existsByEmail(DEFAULT_ADMIN_EMAIL)) {
                User admin = User.builder()
                        .role(adminRole)
                        .fullName("Cozygo Admin")
                        .email(DEFAULT_ADMIN_EMAIL)
                        .password(passwordEncoder.encode(DEFAULT_ADMIN_PASSWORD))
                        .phoneNumber("0900000000")
                        .address("Cozygo System")
                        .gender("OTHER")
                        .userStatus("ACTIVE")
                        .build();

                userRepository.save(admin);
            }
        };
    }

    private Role getOrCreateRole(String roleName, String description) {
        return roleRepository.findByRoleName(roleName)
                .orElseGet(() -> roleRepository.save(Role.builder()
                        .roleName(roleName)
                        .descriptionRole(description)
                        .build()));
    }
}
