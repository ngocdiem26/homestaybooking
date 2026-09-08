package com.homestaybooking.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class AdminRevenueSummaryResponse {
    private LocalDate fromDate;
    private LocalDate toDate;

    private BigDecimal completedBookingValue;
    private Integer completedBookingCount;
    private Integer cancelledBookingCount;
    private BigDecimal commissionRevenue;
    private BigDecimal maintenanceRevenue;
    private BigDecimal totalPlatformRevenue;
    private Integer paidMaintenanceHostCount;
    private BigDecimal averageCommission;
    private BigDecimal pendingMaintenanceAmount;
    private BigDecimal overdueMaintenanceAmount;

    // Deprecated compatibility fields. The admin revenue page no longer uses them.
    private BigDecimal grossCustomerPayments;
    private BigDecimal pendingHeldAmount;
    private BigDecimal pendingHostPayable;
    private BigDecimal paidOutToHosts;
    private BigDecimal totalRefundAmount;
}
