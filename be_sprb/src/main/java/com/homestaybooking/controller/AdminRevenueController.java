package com.homestaybooking.controller;

import com.homestaybooking.dto.request.*;
import com.homestaybooking.dto.response.*;
import com.homestaybooking.service.AdminRevenueService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class AdminRevenueController {
    private final AdminRevenueService adminRevenueService;

    @GetMapping("/api/admin/revenue/summary")
    public AdminRevenueSummaryResponse summary(@RequestHeader(value = "Authorization", required = false) String auth,
                                               @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
                                               @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
                                               @RequestParam(required = false) Integer hostId,
                                               @RequestParam(required = false) Integer homestayId) {
        return adminRevenueService.summary(auth, fromDate, toDate, hostId, homestayId);
    }

    @GetMapping("/api/admin/revenue/chart")
    public List<RevenueChartPointResponse> chart(@RequestHeader(value = "Authorization", required = false) String auth,
                                                 @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
                                                 @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
                                                 @RequestParam(defaultValue = "DAY") String groupBy,
                                                 @RequestParam(required = false) Integer hostId,
                                                 @RequestParam(required = false) Integer homestayId) {
        return adminRevenueService.chart(auth, fromDate, toDate, groupBy, hostId, homestayId);
    }

    @GetMapping("/api/admin/revenue/commissions")
    public PageResponse<AdminCommissionResponse> commissions(@RequestHeader(value = "Authorization", required = false) String auth,
                                                             @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
                                                             @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
                                                             @RequestParam(required = false) Integer hostId,
                                                             @RequestParam(required = false) Integer homestayId,
                                                             @RequestParam(required = false) String commissionStatus,
                                                             @RequestParam(required = false) String paymentMethod,
                                                             @RequestParam(required = false) String keyword,
                                                             @RequestParam(defaultValue = "0") Integer page,
                                                             @RequestParam(defaultValue = "10") Integer size) {
        return adminRevenueService.commissions(auth, fromDate, toDate, hostId, homestayId, commissionStatus, paymentMethod, keyword, page, size);
    }

    @GetMapping("/api/admin/revenue/commissions/{commissionId}")
    public AdminCommissionResponse commissionDetail(@RequestHeader(value = "Authorization", required = false) String auth, @PathVariable Long commissionId) {
        return adminRevenueService.commissionDetail(auth, commissionId);
    }

    @GetMapping("/api/admin/revenue/top-hosts")
    public List<RevenueTopItemResponse> topHosts(@RequestHeader(value = "Authorization", required = false) String auth,
                                                @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
                                                @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
                                                @RequestParam(required = false) Integer hostId,
                                                @RequestParam(required = false) Integer homestayId) { return adminRevenueService.topHosts(auth, fromDate, toDate, hostId, homestayId); }

    @GetMapping("/api/admin/revenue/top-homestays")
    public List<RevenueTopItemResponse> topHomestays(@RequestHeader(value = "Authorization", required = false) String auth,
                                                    @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
                                                    @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
                                                    @RequestParam(required = false) Integer hostId,
                                                    @RequestParam(required = false) Integer homestayId) { return adminRevenueService.topHomestays(auth, fromDate, toDate, hostId, homestayId); }

    @GetMapping("/api/admin/platform-fees/current")
    public PlatformFeeSettingResponse currentFee(@RequestHeader(value = "Authorization", required = false) String auth) { return adminRevenueService.currentFee(auth); }

    @PutMapping("/api/admin/platform-fees/current")
    public PlatformFeeSettingResponse updateFee(@RequestHeader(value = "Authorization", required = false) String auth, @RequestBody PlatformFeeSettingRequest request) { return adminRevenueService.updateFee(auth, request); }

    @GetMapping("/api/admin/maintenance-fees")
    public PageResponse<MaintenanceFeeResponse> maintenanceFees(@RequestHeader(value = "Authorization", required = false) String auth,
                                                                @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
                                                                @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
                                                                @RequestParam(required = false) Integer hostId,
                                                                @RequestParam(required = false) String paymentStatus,
                                                                @RequestParam(defaultValue = "0") Integer page,
                                                                @RequestParam(defaultValue = "10") Integer size) {
        return adminRevenueService.maintenanceFees(auth, fromDate, toDate, hostId, paymentStatus, page, size);
    }

    @PostMapping("/api/admin/maintenance-fees/generate")
    public Map<String, Object> generateFees(@RequestHeader(value = "Authorization", required = false) String auth, @RequestBody(required = false) GenerateMaintenanceFeeRequest request) {
        return Map.of("created", adminRevenueService.generateMaintenanceFees(auth, request));
    }

    @PatchMapping("/api/admin/maintenance-fees/{id}/paid")
    public Map<String, Object> markFeePaid(@RequestHeader(value = "Authorization", required = false) String auth, @PathVariable Long id, @RequestBody(required = false) MaintenancePaymentRequest request) {
        adminRevenueService.markMaintenancePaid(auth, id, request);
        return Map.of("success", true);
    }

    @PatchMapping("/api/admin/maintenance-fees/{id}/waive")
    public Map<String, Object> waiveFee(@RequestHeader(value = "Authorization", required = false) String auth, @PathVariable Long id, @RequestBody(required = false) MaintenancePaymentRequest request) {
        adminRevenueService.waiveMaintenance(auth, id, request);
        return Map.of("success", true);
    }

    @PatchMapping("/api/admin/maintenance-fees/mark-overdue")
    public Map<String, Object> markOverdue(@RequestHeader(value = "Authorization", required = false) String auth) {
        return Map.of("updated", adminRevenueService.markOverdue(auth));
    }
}
