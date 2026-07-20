package com.homestaybooking.controller;

import com.homestaybooking.dto.response.CustomerTierResponse;
import com.homestaybooking.dto.response.TierBenefitResponse;
import com.homestaybooking.service.CustomerTierService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/customer/tier")
@RequiredArgsConstructor
public class CustomerTierController {

    private final CustomerTierService customerTierService;

    @GetMapping("/me")
    public CustomerTierResponse getMyTier(@RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        return customerTierService.getMyTier(authorizationHeader);
    }

    @GetMapping("/overview")
    public List<TierBenefitResponse> getMyTierOverview(@RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        return customerTierService.getMyTierOverview(authorizationHeader);
    }
}
