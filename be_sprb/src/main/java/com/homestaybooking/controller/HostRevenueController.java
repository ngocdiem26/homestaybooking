package com.homestaybooking.controller;

import com.homestaybooking.dto.response.HostRevenueSummaryResponse;
import com.homestaybooking.service.HostRevenueService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/host/revenue")
@RequiredArgsConstructor
public class HostRevenueController {

    private final HostRevenueService hostRevenueService;

    @GetMapping
    public HostRevenueSummaryResponse getRevenue(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false, defaultValue = "day") String groupBy
    ) {
        return hostRevenueService.getRevenue(authorizationHeader, fromDate, toDate, groupBy);
    }
}
