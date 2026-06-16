package com.homestaybooking.controller;

import com.homestaybooking.dto.request.PromotionRequest;
import com.homestaybooking.dto.request.UpdatePromotionStatusRequest;
import com.homestaybooking.dto.response.AdminPromotionResponse;
import com.homestaybooking.service.AdminPromotionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/promotions")
@RequiredArgsConstructor
public class AdminPromotionController {

    private final AdminPromotionService adminPromotionService;

    @GetMapping
    public List<AdminPromotionResponse> getPromotions() {
        return adminPromotionService.getPromotions();
    }

    @PostMapping
    public AdminPromotionResponse createPromotion(@RequestBody PromotionRequest request) {
        return adminPromotionService.createPromotion(request);
    }

    @PutMapping("/{promotionId}")
    public AdminPromotionResponse updatePromotion(
            @PathVariable Integer promotionId,
            @RequestBody PromotionRequest request
    ) {
        return adminPromotionService.updatePromotion(promotionId, request);
    }

    @PatchMapping("/{promotionId}/status")
    public AdminPromotionResponse updateStatus(
            @PathVariable Integer promotionId,
            @RequestBody UpdatePromotionStatusRequest request
    ) {
        return adminPromotionService.updateStatus(promotionId, request);
    }

    @DeleteMapping("/{promotionId}")
    public ResponseEntity<Void> deletePromotion(@PathVariable Integer promotionId) {
        adminPromotionService.deletePromotion(promotionId);
        return ResponseEntity.noContent().build();
    }
}
