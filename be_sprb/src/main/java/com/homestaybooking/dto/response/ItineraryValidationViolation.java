package com.homestaybooking.dto.response;

import java.time.LocalTime;

public record ItineraryValidationViolation(
        Integer dayNumber,
        String itemTitle,
        Integer activityId,
        String generatedTime,
        LocalTime allowedOpeningTime,
        LocalTime allowedClosingTime,
        String reason
) {
}