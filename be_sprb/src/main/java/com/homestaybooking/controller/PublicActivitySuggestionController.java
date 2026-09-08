package com.homestaybooking.controller;

import com.homestaybooking.dto.response.ActivitySuggestionResponse;
import com.homestaybooking.service.ItineraryActivitySuggestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/public/activities")
@RequiredArgsConstructor
public class PublicActivitySuggestionController {

    private final ItineraryActivitySuggestionService suggestionService;

    @GetMapping("/suggest")
    public List<ActivitySuggestionResponse> suggest(
            @RequestParam(required = false) String destination,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String province,
            @RequestParam(required = false) String style,
            @RequestParam(required = false) String interests,
            @RequestParam(required = false, defaultValue = "12") Integer limit
    ) {
        return suggestionService.suggest(destination, city, province, style, splitValues(interests), limit);
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
