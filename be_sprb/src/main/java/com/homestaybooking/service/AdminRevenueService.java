// package com.homestaybooking.service;

// import com.homestaybooking.dto.request.*;
// import com.homestaybooking.dto.response.*;
// import com.homestaybooking.exception.AppException;
// import com.homestaybooking.repository.RevenueJdbcRepository;
// import lombok.RequiredArgsConstructor;
// import org.springframework.stereotype.Service;
// import org.springframework.transaction.annotation.Transactional;

// import java.math.BigDecimal;
// import java.time.LocalDate;
// import java.time.YearMonth;
// import java.util.List;

// @Service
// @RequiredArgsConstructor
// public class AdminRevenueService {
//     private final RevenueAccessService accessService;
//     private final RevenueJdbcRepository revenueRepository;
//     private final HostMaintenanceAlertService maintenanceAlertService;

//     @Transactional
//     public AdminRevenueSummaryResponse summary(String auth, LocalDate fromDate, LocalDate toDate, Integer hostId, Integer homestayId) {
//         accessService.requireAdmin(auth);
//         maintenanceAlertService.syncMaintenanceStatus(LocalDate.now());
//         DateRange range = range(fromDate, toDate);
//         return revenueRepository.adminSummary(range.fromDate(), range.toDate(), hostId, homestayId);
//     }

//     @Transactional(readOnly = true)
//     public List<RevenueChartPointResponse> chart(String auth, LocalDate fromDate, LocalDate toDate, String groupBy, Integer hostId, Integer homestayId) {
//         accessService.requireAdmin(auth);
//         DateRange range = range(fromDate, toDate);
//         return revenueRepository.adminChart(range.fromDate(), range.toDate(), groupBy == null ? "DAY" : groupBy, hostId, homestayId);
//     }

//     @Transactional(readOnly = true)
//     public PageResponse<AdminCommissionResponse> commissions(String auth, LocalDate fromDate, LocalDate toDate, Integer hostId, Integer homestayId, String status, String paymentMethod, String keyword, Integer page, Integer size) {
//         accessService.requireAdmin(auth);
//         DateRange range = range(fromDate, toDate);
//         return revenueRepository.adminCommissions(range.fromDate(), range.toDate(), hostId, homestayId, status, paymentMethod, keyword, page(page), size(size));
//     }

//     @Transactional(readOnly = true)
//     public AdminCommissionResponse commissionDetail(String auth, Long commissionId) {
//         accessService.requireAdmin(auth);
//         return revenueRepository.adminCommissionDetail(commissionId);
//     }

//     @Transactional(readOnly = true)
//     public List<RevenueTopItemResponse> topHosts(String auth, LocalDate fromDate, LocalDate toDate, Integer hostId, Integer homestayId) {
//         accessService.requireAdmin(auth);
//         DateRange range = range(fromDate, toDate);
//         return revenueRepository.topHosts(range.fromDate(), range.toDate(), hostId, homestayId);
//     }

//     @Transactional(readOnly = true)
//     public List<RevenueTopItemResponse> topHomestays(String auth, LocalDate fromDate, LocalDate toDate, Integer hostId, Integer homestayId) {
//         accessService.requireAdmin(auth);
//         DateRange range = range(fromDate, toDate);
//         return revenueRepository.topHomestays(range.fromDate(), range.toDate(), hostId, homestayId);
//     }
// @Transactional(readOnly = true)
//     public PlatformFeeSettingResponse currentFee(String auth) { accessService.requireAdmin(auth); return revenueRepository.getActiveFeeSetting(LocalDate.now()); }

//     @Transactional
//     public PlatformFeeSettingResponse updateFee(String auth, PlatformFeeSettingRequest request) {
//         accessService.requireAdmin(auth);
//         if (request == null) throw new AppException("INVALID_PLATFORM_FEE_SETTING");
//         BigDecimal rate = request.getCommissionRate();
//         BigDecimal monthly = request.getMonthlyMaintenanceFee();
//         if (rate == null || rate.compareTo(BigDecimal.ZERO) < 0 || rate.compareTo(BigDecimal.valueOf(100)) > 0) throw new AppException("INVALID_COMMISSION_RATE");
//         if (monthly == null || monthly.compareTo(BigDecimal.ZERO) < 0) throw new AppException("INVALID_MAINTENANCE_FEE");
//         int trial = request.getFreeTrialDays() == null ? 30 : Math.max(0, request.getFreeTrialDays());
//         int grace = request.getGracePeriodDays() == null ? 3 : Math.max(0, request.getGracePeriodDays());
//         return revenueRepository.createNewFeeSetting(request.getSettingName(), rate, monthly, trial, grace, request.getEffectiveFrom());
//     }

//     @Transactional
//     public PageResponse<MaintenanceFeeResponse> maintenanceFees(String auth, LocalDate fromDate, LocalDate toDate, Integer hostId, String status, Integer page, Integer size) {
//         accessService.requireAdmin(auth);
//         maintenanceAlertService.syncMaintenanceStatus(LocalDate.now());
//         DateRange range = range(fromDate, toDate);
//         return revenueRepository.maintenanceFees(range.fromDate(), range.toDate(), hostId, status, page(page), size(size));
//     }

//     @Transactional
//     public int generateMaintenanceFees(String auth, GenerateMaintenanceFeeRequest request) {
//         accessService.requireAdmin(auth);
//         YearMonth ym = YearMonth.of(request == null || request.getYear() == null ? LocalDate.now().getYear() : request.getYear(), request == null || request.getMonth() == null ? LocalDate.now().getMonthValue() : request.getMonth());
//         return revenueRepository.generateMaintenanceFees(ym.getYear(), ym.getMonthValue(), revenueRepository.getActiveFeeSetting(LocalDate.now()));
//     }

//     @Transactional
//     public void markMaintenancePaid(String auth, Long id, MaintenancePaymentRequest request) {
//         accessService.requireAdmin(auth);
//         int updated = revenueRepository.markMaintenancePaid(id, request == null ? "BANK_TRANSFER" : request.getPaymentMethod(), request == null ? null : request.getTransactionReference(), request == null ? null : request.getAdminNote());
//         if (updated == 0) throw new AppException("MAINTENANCE_FEE_NOT_PAYABLE");
//     }

//     @Transactional
//     public void waiveMaintenance(String auth, Long id, MaintenancePaymentRequest request) {
//         accessService.requireAdmin(auth);
//         int updated = revenueRepository.waiveMaintenance(id, request == null ? null : request.getAdminNote());
//         if (updated == 0) throw new AppException("MAINTENANCE_FEE_NOT_WAIVABLE");
//     }

//     @Transactional
//     public int markOverdue(String auth) { accessService.requireAdmin(auth); int updated = revenueRepository.markOverdueFees(LocalDate.now()); maintenanceAlertService.processAlerts(LocalDate.now()); return updated; }

//     private DateRange range(LocalDate fromDate, LocalDate toDate) {
//         LocalDate today = LocalDate.now();
//         LocalDate start = fromDate == null ? today.withDayOfMonth(1) : fromDate;
//         LocalDate end = toDate == null ? today : toDate;
//         if (end.isBefore(start)) throw new AppException("Khoảng ngày không hợp lệ");
//         return new DateRange(start, end);
//     }
//     private int page(Integer value) { return Math.max(0, value == null ? 0 : value); }
//     private int size(Integer value) { return Math.max(1, Math.min(100, value == null ? 10 : value)); }
//     private record DateRange(LocalDate fromDate, LocalDate toDate) {}
// }
package com.homestaybooking.service;

import com.homestaybooking.dto.request.*;
import com.homestaybooking.dto.response.*;
import com.homestaybooking.exception.AppException;
import com.homestaybooking.repository.RevenueJdbcRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminRevenueService {
    private final RevenueAccessService accessService;
    private final RevenueJdbcRepository revenueRepository;
    private final HostMaintenanceAlertService maintenanceAlertService;

    @Transactional
    public AdminRevenueSummaryResponse summary(String auth, LocalDate fromDate, LocalDate toDate, Integer hostId, Integer homestayId) {
        accessService.requireAdmin(auth);
        maintenanceAlertService.syncMaintenanceStatus(LocalDate.now());
        DateRange range = range(fromDate, toDate);
        return revenueRepository.adminSummary(range.fromDate(), range.toDate(), hostId, homestayId);
    }

    @Transactional(readOnly = true)
    public List<RevenueChartPointResponse> chart(String auth, LocalDate fromDate, LocalDate toDate, String groupBy, Integer hostId, Integer homestayId) {
        accessService.requireAdmin(auth);
        DateRange range = range(fromDate, toDate);
        String resolvedGroupBy = resolveGroupBy(range, groupBy);
        return revenueRepository.adminChart(range.fromDate(), range.toDate(), resolvedGroupBy, hostId, homestayId);
    }

    @Transactional(readOnly = true)
    public PageResponse<AdminCommissionResponse> commissions(String auth, LocalDate fromDate, LocalDate toDate, Integer hostId, Integer homestayId, String status, String paymentMethod, String keyword, Integer page, Integer size) {
        accessService.requireAdmin(auth);
        DateRange range = range(fromDate, toDate);
        return revenueRepository.adminCommissions(range.fromDate(), range.toDate(), hostId, homestayId, status, paymentMethod, keyword, page(page), size(size));
    }

    @Transactional(readOnly = true)
    public AdminCommissionResponse commissionDetail(String auth, Long commissionId) {
        accessService.requireAdmin(auth);
        return revenueRepository.adminCommissionDetail(commissionId);
    }

    @Transactional(readOnly = true)
    public List<RevenueTopItemResponse> topHosts(String auth, LocalDate fromDate, LocalDate toDate, Integer hostId, Integer homestayId) {
        accessService.requireAdmin(auth);
        DateRange range = range(fromDate, toDate);
        return revenueRepository.topHosts(range.fromDate(), range.toDate(), hostId, homestayId);
    }

    @Transactional(readOnly = true)
    public List<RevenueTopItemResponse> topHomestays(String auth, LocalDate fromDate, LocalDate toDate, Integer hostId, Integer homestayId) {
        accessService.requireAdmin(auth);
        DateRange range = range(fromDate, toDate);
        return revenueRepository.topHomestays(range.fromDate(), range.toDate(), hostId, homestayId);
    }
@Transactional(readOnly = true)
    public PlatformFeeSettingResponse currentFee(String auth) { accessService.requireAdmin(auth); return revenueRepository.getActiveFeeSetting(LocalDate.now()); }

    @Transactional
    public PlatformFeeSettingResponse updateFee(String auth, PlatformFeeSettingRequest request) {
        accessService.requireAdmin(auth);
        if (request == null) throw new AppException("INVALID_PLATFORM_FEE_SETTING");
        BigDecimal rate = request.getCommissionRate();
        BigDecimal monthly = request.getMonthlyMaintenanceFee();
        if (rate == null || rate.compareTo(BigDecimal.ZERO) < 0 || rate.compareTo(BigDecimal.valueOf(100)) > 0) throw new AppException("INVALID_COMMISSION_RATE");
        if (monthly == null || monthly.compareTo(BigDecimal.ZERO) < 0) throw new AppException("INVALID_MAINTENANCE_FEE");
        int trial = request.getFreeTrialDays() == null ? 30 : Math.max(0, request.getFreeTrialDays());
        int grace = request.getGracePeriodDays() == null ? 3 : Math.max(0, request.getGracePeriodDays());
        return revenueRepository.createNewFeeSetting(request.getSettingName(), rate, monthly, trial, grace, request.getEffectiveFrom());
    }

    @Transactional
    public PageResponse<MaintenanceFeeResponse> maintenanceFees(String auth, LocalDate fromDate, LocalDate toDate, Integer hostId, String status, Integer page, Integer size) {
        accessService.requireAdmin(auth);
        maintenanceAlertService.syncMaintenanceStatus(LocalDate.now());
        DateRange range = range(fromDate, toDate);
        return revenueRepository.maintenanceFees(range.fromDate(), range.toDate(), hostId, status, page(page), size(size));
    }

    @Transactional
    public int generateMaintenanceFees(String auth, GenerateMaintenanceFeeRequest request) {
        accessService.requireAdmin(auth);
        YearMonth ym = YearMonth.of(request == null || request.getYear() == null ? LocalDate.now().getYear() : request.getYear(), request == null || request.getMonth() == null ? LocalDate.now().getMonthValue() : request.getMonth());
        return revenueRepository.generateMaintenanceFees(ym.getYear(), ym.getMonthValue(), revenueRepository.getActiveFeeSetting(LocalDate.now()));
    }

    @Transactional
    public void markMaintenancePaid(String auth, Long id, MaintenancePaymentRequest request) {
        accessService.requireAdmin(auth);
        int updated = revenueRepository.markMaintenancePaid(id, request == null ? "BANK_TRANSFER" : request.getPaymentMethod(), request == null ? null : request.getTransactionReference(), request == null ? null : request.getAdminNote());
        if (updated == 0) throw new AppException("MAINTENANCE_FEE_NOT_PAYABLE");
    }

    @Transactional
    public void waiveMaintenance(String auth, Long id, MaintenancePaymentRequest request) {
        accessService.requireAdmin(auth);
        int updated = revenueRepository.waiveMaintenance(id, request == null ? null : request.getAdminNote());
        if (updated == 0) throw new AppException("MAINTENANCE_FEE_NOT_WAIVABLE");
    }

    @Transactional
    public int markOverdue(String auth) { accessService.requireAdmin(auth); int updated = revenueRepository.markOverdueFees(LocalDate.now()); maintenanceAlertService.processAlerts(LocalDate.now()); return updated; }

    private DateRange range(LocalDate fromDate, LocalDate toDate) {
        LocalDate today = LocalDate.now();
        LocalDate start = fromDate == null ? today.withDayOfMonth(1) : fromDate;
        LocalDate end = toDate == null ? today : toDate;
        if (end.isBefore(start)) throw new AppException("Khoảng ngày không hợp lệ");
        return new DateRange(start, end);
    }
    private String resolveGroupBy(DateRange range, String requestedGroupBy) {
        long days = ChronoUnit.DAYS.between(range.fromDate(), range.toDate()) + 1;
        String normalized = requestedGroupBy == null ? "AUTO" : requestedGroupBy.trim().toUpperCase();

        if ("MONTH".equals(normalized)) {
            return "MONTH";
        }

        if ("DAY".equals(normalized)) {
            return days > 366 ? "MONTH" : "DAY";
        }

        return days > 62 ? "MONTH" : "DAY";
    }

    private int page(Integer value) { return Math.max(0, value == null ? 0 : value); }
    private int size(Integer value) { return Math.max(1, Math.min(100, value == null ? 10 : value)); }
    private record DateRange(LocalDate fromDate, LocalDate toDate) {}
}
