package com.homestaybooking.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class HostRevenueTrendResponse {
    private String period;
    private BigDecimal revenue;
    private BigDecimal grossBookingAmount;
    private BigDecimal commissionDeducted;
    private BigDecimal pendingPayout;
    private Integer bookingCount;
}
