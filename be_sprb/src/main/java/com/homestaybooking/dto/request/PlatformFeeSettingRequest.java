package com.homestaybooking.dto.request;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class PlatformFeeSettingRequest {
    private String settingName;
    private BigDecimal commissionRate;
    private BigDecimal monthlyMaintenanceFee;
    private Integer freeTrialDays;
    private Integer gracePeriodDays;
    private LocalDate effectiveFrom;
}
