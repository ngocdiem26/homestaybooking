package com.homestaybooking.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class RevenueChartPointResponse {
    private String period;
    private BigDecimal completedBookingValue;
    private Integer completedBookingCount;
    private BigDecimal commissionRevenue;
    private BigDecimal maintenanceRevenue;
    private BigDecimal totalPlatformRevenue;

    // Deprecated compatibility fields. Kept so older host/admin code can compile.
    private BigDecimal totalRevenue;
    private BigDecimal hostPayable;
    private BigDecimal refundAmount;
}
