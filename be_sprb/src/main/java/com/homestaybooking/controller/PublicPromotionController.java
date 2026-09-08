package com.homestaybooking.controller;

import com.homestaybooking.dto.response.PublicPromotionResponse;
import com.homestaybooking.service.PublicPromotionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/public/promotions")
@RequiredArgsConstructor
public class PublicPromotionController {

    private final PublicPromotionService publicPromotionService;

    @GetMapping
    public List<PublicPromotionResponse> getPromotions(@RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        return publicPromotionService.getPromotions(authorizationHeader);
    }
}
