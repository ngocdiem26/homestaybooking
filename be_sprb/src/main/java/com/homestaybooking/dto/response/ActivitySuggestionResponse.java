package com.homestaybooking.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActivitySuggestionResponse {
    private Integer activityId;
    private String activityName;
    private String province;
    private String city;
    private String address;
    private String shortDescription;
    private String description;
    private String thumbnailUrl;
    private String hotline;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String tags;
    private String suitableTravelStyles;
    private LocalTime openingTime;
    private LocalTime closingTime;
    private Integer recommendedDurationMinutes;
    private String bestTimeOfDay;
    private String activityIntensity;
    private String intensity;
    private BigDecimal estimatedCostMin;
    private BigDecimal estimatedCostMax;
    private Integer matchScore;
}