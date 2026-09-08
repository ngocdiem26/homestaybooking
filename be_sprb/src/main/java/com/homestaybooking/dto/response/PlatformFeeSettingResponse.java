package com.homestaybooking.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class PlatformFeeSettingResponse {
    private Long settingId;
    private String settingName;
    private BigDecimal commissionRate;
    private BigDecimal monthlyMaintenanceFee;
    private Integer freeTrialDays;
    private Integer gracePeriodDays;
    private LocalDate effectiveFrom;
    private LocalDate effectiveTo;
    private String settingStatus;
}
