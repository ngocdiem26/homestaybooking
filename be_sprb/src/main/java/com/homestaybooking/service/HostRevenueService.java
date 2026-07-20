package com.homestaybooking.service;

import com.homestaybooking.dto.response.HostRevenueSummaryResponse;
import com.homestaybooking.entity.User;
import com.homestaybooking.exception.AppException;
import com.homestaybooking.repository.HostRevenueJdbcRepository;
import com.homestaybooking.repository.UserRepository;
import com.homestaybooking.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Locale;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class HostRevenueService {

    private final HostRevenueJdbcRepository hostRevenueRepository;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    @Transactional(readOnly = true)
    public HostRevenueSummaryResponse getRevenue(String authorizationHeader, LocalDate fromDate, LocalDate toDate, String groupBy) {
        User host = resolveUser(authorizationHeader);
        requireRole(host, Set.of("HOST", "ADMIN"));

        LocalDate today = LocalDate.now();
        LocalDate start = fromDate == null ? today.withDayOfMonth(1) : fromDate;
        LocalDate end = toDate == null ? today : toDate;
        if (end.isBefore(start)) {
            throw new AppException("Khoảng ngày doanh thu không hợp lệ");
        }

        String normalizedGroupBy = groupBy == null ? "day" : groupBy.trim().toLowerCase(Locale.ROOT);
        if (!Set.of("day", "month").contains(normalizedGroupBy)) {
            normalizedGroupBy = "day";
        }

        return hostRevenueRepository.getRevenue(host.getUserId(), start, end, normalizedGroupBy);
    }

    private User resolveUser(String authorizationHeader) {
        String email = jwtUtil.extractEmailFromAuthorizationHeader(authorizationHeader);
        if (email == null) {
            throw new AppException("Vui lòng đăng nhập để xem doanh thu");
        }
        return userRepository.findByEmail(email).orElseThrow(() -> new AppException("Không tìm thấy tài khoản đang đăng nhập"));
    }

    private void requireRole(User user, Set<String> roles) {
        String roleName = user.getRole() == null ? "" : user.getRole().getRoleName();
        String normalizedRole = roleName == null ? "" : roleName.toUpperCase(Locale.ROOT);
        if (!roles.contains(normalizedRole)) {
            throw new AppException("Bạn không có quyền xem doanh thu của chủ homestay");
        }
    }
}
