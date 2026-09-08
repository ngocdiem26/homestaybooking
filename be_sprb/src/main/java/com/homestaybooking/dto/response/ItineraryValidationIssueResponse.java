package com.homestaybooking.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItineraryValidationIssueResponse {

    /**
     * Mã lỗi ổn định để frontend có thể hiển thị/nhóm cảnh báo.
     */
    private String code;

    /**
     * WARNING: vẫn hiển thị lịch và cho người dùng tự sửa.
     * FATAL: dữ liệu không đủ an toàn để lưu/hiển thị như một lịch hợp lệ.
     */
    private String severity;

    private Integer dayNumber;
    private String itemTitle;
    private Integer activityId;
    private String generatedTime;
    private LocalTime allowedOpeningTime;
    private LocalTime allowedClosingTime;

    private String message;
    private String suggestedFix;
}
