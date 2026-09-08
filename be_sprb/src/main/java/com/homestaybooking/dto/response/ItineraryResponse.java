package com.homestaybooking.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItineraryResponse {
    private String itineraryCode;
    private String itineraryTitle;
    private String destinationKeyword;
    private String city;
    private String province;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer totalDays;
    private Integer travelerCount;
    private String travelStyle;
    private String pace;
    private String summary;
    private String itineraryStatus;
    private String generationStatus;

    /**
     * VALID: không có cảnh báo.
     * WARNING: lịch vẫn được hiển thị/lưu nhưng có điểm cần người dùng kiểm tra.
     * ERROR: dữ liệu cũ có lỗi nghiêm trọng; vẫn cho xem để người dùng biết vấn đề.
     */
    private String validationStatus;

    private Integer warningCount;

    @Builder.Default
    private List<ItineraryValidationIssueResponse> validationIssues = new ArrayList<>();

    private Integer itemCount;
    private LocalDateTime createdAt;

    @Builder.Default
    private List<ItineraryDayResponse> days = new ArrayList<>();
}