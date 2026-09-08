package com.homestaybooking.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ItineraryUpdateItemRequest {
    private Long itemId;
    private Integer dayNumber;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer durationMinutes;
    private String preferredTimeOfDay;
    private Boolean fixedTime;
    private String title;
    private String locationName;
    private String address;
    private String itemType;
    private String sourceType;
    private Long sourceId;
    private Integer activityId;
    private Integer homestayId;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private BigDecimal estimatedCost;
    private String transportNote;
    private String note;
    private Integer displayOrder;
}