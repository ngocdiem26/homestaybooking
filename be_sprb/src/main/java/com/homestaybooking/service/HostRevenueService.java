package com.homestaybooking.service;

import com.homestaybooking.dto.response.*;
import com.homestaybooking.entity.User;
import com.homestaybooking.exception.AppException;
import com.homestaybooking.repository.RevenueJdbcRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class HostRevenueService {
    private final RevenueJdbcRepository revenueRepository;
    private final RevenueAccessService accessService;
    private final HostMaintenanceAlertService maintenanceAlertService;

    @Transactional(readOnly = true)
    public HostRevenueSummaryResponse getRevenue(String authorizationHeader, LocalDate fromDate, LocalDate toDate, String groupBy, Integer homestayId) {
        User host = accessService.requireHost(authorizationHeader);
        DateRange range = range(fromDate, toDate);
        String normalizedGroupBy = groupBy == null ? "day" : groupBy.trim().toLowerCase(Locale.ROOT);
        if (!Set.of("day", "month").contains(normalizedGroupBy)) normalizedGroupBy = "day";
        return revenueRepository.hostSummary(host.getUserId(), range.fromDate(), range.toDate(), normalizedGroupBy, homestayId);
    }

    @Transactional(readOnly = true)
    public PageResponse<HostRevenueBookingResponse> getBookings(String authorizationHeader, LocalDate fromDate, LocalDate toDate, Integer homestayId, String status, String keyword, Integer page, Integer size) {
        User host = accessService.requireHost(authorizationHeader);
        DateRange range = range(fromDate, toDate);
        return revenueRepository.hostBookings(host.getUserId(), range.fromDate(), range.toDate(), homestayId, status, keyword, Math.max(0, page == null ? 0 : page), Math.max(1, Math.min(100, size == null ? 10 : size)));
    }

    @Transactional(readOnly = true)
    public MaintenanceFeeResponse currentMaintenanceFee(String authorizationHeader) {
        User host = accessService.requireHost(authorizationHeader);
        return revenueRepository.currentMaintenanceFee(host.getUserId());
    }

    @Transactional(readOnly = true)
    public List<MaintenanceFeeResponse> maintenanceHistory(String authorizationHeader, Integer year, String status, Integer page, Integer size) {
        User host = accessService.requireHost(authorizationHeader);
        return revenueRepository.hostMaintenanceHistory(host.getUserId(), year, status, Math.max(0, page == null ? 0 : page), Math.max(1, Math.min(100, size == null ? 10 : size)));
    }


    @Transactional
    public List<HostMaintenanceNotificationResponse> maintenanceNotifications(String authorizationHeader) {
        User host = accessService.requireHost(authorizationHeader);
        maintenanceAlertService.syncMaintenanceStatus(LocalDate.now());
        return revenueRepository.hostMaintenanceNotifications(host.getUserId(), LocalDate.now());
    }
    private DateRange range(LocalDate fromDate, LocalDate toDate) {
        LocalDate today = LocalDate.now();
        LocalDate start = fromDate == null ? today.withDayOfMonth(1) : fromDate;
        LocalDate end = toDate == null ? today : toDate;
        if (end.isBefore(start)) throw new AppException("INVALID_DATE_RANGE");
        return new DateRange(start, end);
    }
    private record DateRange(LocalDate fromDate, LocalDate toDate) {}
}
