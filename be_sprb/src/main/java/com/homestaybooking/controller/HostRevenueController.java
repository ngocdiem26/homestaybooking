package com.homestaybooking.controller;

import com.homestaybooking.dto.response.*;
import com.homestaybooking.service.HostRevenueService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/host")
@RequiredArgsConstructor
public class HostRevenueController {
    private final HostRevenueService hostRevenueService;

    @GetMapping("/revenue")
    public HostRevenueSummaryResponse getRevenue(@RequestHeader(value = "Authorization", required = false) String authorizationHeader,
                                                 @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
                                                 @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
                                                 @RequestParam(required = false, defaultValue = "day") String groupBy,
                                                 @RequestParam(required = false) Integer homestayId) {
        return hostRevenueService.getRevenue(authorizationHeader, fromDate, toDate, groupBy, homestayId);
    }

    @GetMapping("/revenue/summary")
    public HostRevenueSummaryResponse summary(@RequestHeader(value = "Authorization", required = false) String authorizationHeader,
                                              @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
                                              @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
                                              @RequestParam(required = false, defaultValue = "day") String groupBy,
                                              @RequestParam(required = false) Integer homestayId) {
        return hostRevenueService.getRevenue(authorizationHeader, fromDate, toDate, groupBy, homestayId);
    }

    @GetMapping("/revenue/bookings")
    public PageResponse<HostRevenueBookingResponse> bookings(@RequestHeader(value = "Authorization", required = false) String authorizationHeader,
                                                             @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
                                                             @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
                                                             @RequestParam(required = false) String commissionStatus,
                                                             @RequestParam(required = false) String keyword,
                                                             @RequestParam(required = false) Integer homestayId,
                                                             @RequestParam(defaultValue = "0") Integer page,
                                                             @RequestParam(defaultValue = "10") Integer size) {
        return hostRevenueService.getBookings(authorizationHeader, fromDate, toDate, homestayId, commissionStatus, keyword, page, size);
    }

    @GetMapping("/maintenance-fees/notifications")
    public List<HostMaintenanceNotificationResponse> maintenanceNotifications(@RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        return hostRevenueService.maintenanceNotifications(authorizationHeader);
    }

    @GetMapping("/maintenance-fees/current")
    public MaintenanceFeeResponse currentMaintenanceFee(@RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        return hostRevenueService.currentMaintenanceFee(authorizationHeader);
    }

    @GetMapping("/maintenance-fees/history")
    public List<MaintenanceFeeResponse> maintenanceHistory(@RequestHeader(value = "Authorization", required = false) String authorizationHeader,
                                                           @RequestParam(required = false) Integer year,
                                                           @RequestParam(required = false) String paymentStatus,
                                                           @RequestParam(defaultValue = "0") Integer page,
                                                           @RequestParam(defaultValue = "10") Integer size) {
        return hostRevenueService.maintenanceHistory(authorizationHeader, year, paymentStatus, page, size);
    }
}