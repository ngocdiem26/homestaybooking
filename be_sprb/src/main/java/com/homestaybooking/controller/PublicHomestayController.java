package com.homestaybooking.controller;

import com.homestaybooking.dto.response.PublicActivityResponse;
import com.homestaybooking.dto.response.PublicDestinationResponse;
import com.homestaybooking.dto.response.PublicHomestayResponse;
import com.homestaybooking.service.PublicHomestayService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicHomestayController {

    private final PublicHomestayService publicHomestayService;

    @GetMapping("/destinations")
    public List<PublicDestinationResponse> getDestinations() {
        return publicHomestayService.getDestinations();
    }

    @GetMapping("/activities")
    public List<PublicActivityResponse> getActivities() {
        return publicHomestayService.getActivities();
    }

    @GetMapping("/homestays/{homeId}")
    public PublicHomestayResponse getHomestayDetail(@PathVariable Integer homeId) {
        return publicHomestayService.getHomestayDetail(homeId);
    }
    @GetMapping("/homestays")
    public List<PublicHomestayResponse> getHomestays(
            @RequestParam(required = false) String destination,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String amenities,
            @RequestParam(required = false) String services,
            @RequestParam(required = false, defaultValue = "recommended") String sort
    ) {
        return publicHomestayService.getHomestays(
                destination,
                maxPrice,
                splitValues(amenities),
                splitValues(services),
                sort
        );
    }

    private List<String> splitValues(String value) {
        if (value == null || value.isBlank()) {
            return List.of();
        }
        return Arrays.stream(value.split(","))
                .map(String::trim)
                .filter(item -> !item.isBlank())
                .toList();
    }
}


