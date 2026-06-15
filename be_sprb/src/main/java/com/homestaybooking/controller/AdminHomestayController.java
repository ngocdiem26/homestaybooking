package com.homestaybooking.controller;

import com.homestaybooking.dto.request.UpdateHomestayStatusRequest;
import com.homestaybooking.dto.response.AdminHomestayResponse;
import com.homestaybooking.service.AdminHomestayService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/homestays")
@RequiredArgsConstructor
public class AdminHomestayController {

    private final AdminHomestayService adminHomestayService;

    @GetMapping
    public List<AdminHomestayResponse> getHomestays() {
        return adminHomestayService.getHomestays();
    }

    @PatchMapping("/{homeId}/status")
    public AdminHomestayResponse updateStatus(
            @PathVariable Integer homeId,
            @RequestBody UpdateHomestayStatusRequest request
    ) {
        return adminHomestayService.updateStatus(homeId, request);
    }

    @DeleteMapping("/{homeId}")
    public ResponseEntity<Void> deleteHomestay(@PathVariable Integer homeId) {
        adminHomestayService.deleteHomestay(homeId);
        return ResponseEntity.noContent().build();
    }
}
