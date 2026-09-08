package com.homestaybooking.controller;

import com.homestaybooking.dto.request.HostAvailabilityUpdateRequest;
import com.homestaybooking.dto.response.HostAvailabilityCalendarResponse;
import com.homestaybooking.service.HostAvailabilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/host/availability")
@RequiredArgsConstructor
public class HostAvailabilityController {
    private final HostAvailabilityService hostAvailabilityService;

    @GetMapping
    public HostAvailabilityCalendarResponse getCalendar(
            @RequestParam Integer homeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        return hostAvailabilityService.getCalendar(homeId, fromDate, toDate, authorizationHeader);
    }

    @PatchMapping
    public HostAvailabilityCalendarResponse updateRange(
            @RequestBody HostAvailabilityUpdateRequest request,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        return hostAvailabilityService.updateRange(request, authorizationHeader);
    }
}
