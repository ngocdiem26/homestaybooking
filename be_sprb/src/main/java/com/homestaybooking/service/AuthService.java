package com.homestaybooking.service;

import com.homestaybooking.dto.request.GoogleLoginRequest;
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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.LocalDate;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$");
    private static final Pattern VN_PHONE_PATTERN = Pattern.compile("^(0|\\+84)(3|5|7|8|9)\\d{8}$");

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Value("${google.oauth.client-id:}")
    private String googleClientId;

    public AuthResponse register(RegisterRequest request) {
        validateRegisterRequest(request);

        String email = normalize(request.getEmail()).toLowerCase(Locale.ROOT);
        if (userRepository.existsByEmail(email)) {
            throw new AppException("Email already exists");
        }

        String roleName = request.getRoleName();
        if (roleName == null || roleName.isBlank()) {
            roleName = "CUSTOMER";
        }

        final String normalizedRoleName = roleName.toUpperCase(Locale.ROOT);
        if (!normalizedRoleName.equals("CUSTOMER") && !normalizedRoleName.equals("HOST")) {
            throw new AppException("Invalid role");
        }

        Role role = roleRepository.findByRoleName(normalizedRoleName)
                .orElseThrow(() -> new AppException("Role does not exist in database: " + normalizedRoleName));

        User user = User.builder()
                .fullName(normalize(request.getFullName()))
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .phoneNumber(normalize(request.getPhoneNumber()).replaceAll("\\s+", ""))
                .birthday(request.getBirthday())
                .gender(normalizeGender(request.getGender()))
                .address(normalize(request.getAddress()))
                .role(role)
                .userStatus("ACTIVE")
                .build();

        User savedUser = userRepository.save(user);

        return buildAuthResponse(savedUser);
    }

    public AuthResponse login(LoginRequest request) {
        String email = normalize(request.getEmail()).toLowerCase(Locale.ROOT);
        if (!EMAIL_PATTERN.matcher(email).matches()) {
            throw new AppException("Email khĂ´ng Ä‘Ăºng Ä‘á»‹nh dáº¡ng");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException("Email does not exist"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new AppException("Incorrect password");
        }

        if (!"ACTIVE".equals(user.getUserStatus())) {
            throw new AppException("Account is locked or inactive");
        }

        return buildAuthResponse(user);
    }

    public AuthResponse loginWithGoogle(GoogleLoginRequest request) {
        if (request == null || request.getCredential() == null || request.getCredential().isBlank()) {
            throw new AppException("Google credential is required");
        }

        if (googleClientId == null || googleClientId.isBlank()) {
            throw new AppException("Google Client ID has not been configured");
        }

        Map<String, Object> profile = verifyGoogleToken(request.getCredential());
        String email = String.valueOf(profile.getOrDefault("email", "")).trim().toLowerCase(Locale.ROOT);
        String fullName = String.valueOf(profile.getOrDefault("name", "")).trim();
        String avatar = String.valueOf(profile.getOrDefault("picture", "")).trim();

        if (email.isBlank()) {
            throw new AppException("Google account email is empty");
        }

        User user = userRepository.findByEmail(email)
                .orElseGet(() -> createGoogleCustomer(email, fullName, avatar));

        if (!"ACTIVE".equals(user.getUserStatus())) {
            throw new AppException("Account is locked or inactive");
        }

        return buildAuthResponse(user);
    }

    private void validateRegisterRequest(RegisterRequest request) {
        if (request == null) {
            throw new AppException("Dá»¯ liá»‡u Ä‘Äƒng kĂ½ khĂ´ng há»£p lá»‡");
        }

        String fullName = normalize(request.getFullName());
        String email = normalize(request.getEmail()).toLowerCase(Locale.ROOT);
        String password = request.getPassword() == null ? "" : request.getPassword();
        String phone = normalize(request.getPhoneNumber()).replaceAll("\\s+", "");
        String address = normalize(request.getAddress());

        if (fullName.length() < 2) {
            throw new AppException("Há» tĂªn pháº£i cĂ³ Ă­t nháº¥t 2 kĂ½ tá»±");
        }
        if (!EMAIL_PATTERN.matcher(email).matches()) {
            throw new AppException("Email khĂ´ng Ä‘Ăºng Ä‘á»‹nh dáº¡ng");
        }
        if (password.length() < 8 || !password.matches(".*[A-Za-z].*") || !password.matches(".*\\d.*")) {
            throw new AppException("Máº­t kháº©u pháº£i cĂ³ Ă­t nháº¥t 8 kĂ½ tá»±, gá»“m chá»¯ vĂ  sá»‘");
        }
        if (!VN_PHONE_PATTERN.matcher(phone).matches()) {
            throw new AppException("Sá»‘ Ä‘iá»‡n thoáº¡i Viá»‡t Nam khĂ´ng há»£p lá»‡");
        }
        if (request.getBirthday() == null || request.getBirthday().isAfter(LocalDate.now())) {
            throw new AppException("NgĂ y sinh khĂ´ng há»£p lá»‡");
        }
        normalizeGender(request.getGender());
        if (address.length() < 5) {
            throw new AppException("Äá»‹a chá»‰ thÆ°á»ng trĂº pháº£i cĂ³ Ă­t nháº¥t 5 kĂ½ tá»±");
        }
    }

    private String normalizeGender(String gender) {
        String value = normalize(gender).toLowerCase(Locale.ROOT);
        if (!value.equals("male") && !value.equals("female") && !value.equals("other")) {
            throw new AppException("Giá»›i tĂ­nh khĂ´ng há»£p lá»‡");
        }
        return value;
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim();
    }

    private Map<String, Object> verifyGoogleToken(String credential) {
        String url = UriComponentsBuilder
                .fromUriString("https://oauth2.googleapis.com/tokeninfo")
                .queryParam("id_token", credential)
                .toUriString();

        Map<String, Object> profile;

        try {
            profile = new RestTemplate().getForObject(url, Map.class);
        } catch (Exception exception) {
            throw new AppException("Cannot verify Google login token");
        }

        if (profile == null) {
            throw new AppException("Invalid Google login token");
        }

        String audience = String.valueOf(profile.getOrDefault("aud", ""));
        if (!googleClientId.equals(audience)) {
            throw new AppException("Google login token is not for this application");
        }

        String emailVerified = String.valueOf(profile.getOrDefault("email_verified", "false"));
        if (!"true".equalsIgnoreCase(emailVerified)) {
            throw new AppException("Google email has not been verified");
        }

        return profile;
    }

    private User createGoogleCustomer(String email, String fullName, String avatar) {
        Role customerRole = roleRepository.findByRoleName("CUSTOMER")
                .orElseThrow(() -> new AppException("Role CUSTOMER does not exist in database"));

        String displayName = fullName == null || fullName.isBlank()
                ? email.substring(0, email.indexOf("@"))
                : fullName;

        User user = User.builder()
                .fullName(displayName)
                .email(email)
                .password(passwordEncoder.encode("GOOGLE_" + UUID.randomUUID()))
                .phoneNumber("0900000000")
                .avatar(avatar == null || avatar.isBlank() ? null : avatar)
                .role(customerRole)
                .userStatus("ACTIVE")
                .build();

        return userRepository.save(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().getRoleName());

        return AuthResponse.builder()
                .userId(user.getUserId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .roleName(user.getRole().getRoleName())
                .avatar(user.getAvatar())
                .birthday(user.getBirthday())
                .token(token)
                .build();
    }
}
