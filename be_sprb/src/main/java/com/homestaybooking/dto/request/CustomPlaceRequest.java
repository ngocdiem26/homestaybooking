package com.homestaybooking.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomPlaceRequest {
    private String title;
    private String name;
    private String itemType;
    private Integer dayNumber;
    private String startTime;
    private String endTime;
    private Integer durationMinutes;
    private String preferredTimeOfDay;
    private String address;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String note;
    private Boolean fixedTime;

    public String displayTitle() {
        if (title != null && !title.isBlank()) return title.trim();
        if (name != null && !name.isBlank()) return name.trim();
        return null;
    }
}
