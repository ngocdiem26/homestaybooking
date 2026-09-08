package com.homestaybooking.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItineraryItemResponse {
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

    /**
     * Cảnh báo gắn trực tiếp với item này để frontend có thể
     * đánh dấu đúng hoạt động cần người dùng chỉnh sửa.
     */
    @Builder.Default
    private List<ItineraryValidationIssueResponse> validationIssues = new ArrayList<>();
}