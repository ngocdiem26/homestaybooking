package com.homestaybooking.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
public class HostRevenueSummaryResponse {
    private LocalDate fromDate;
    private LocalDate toDate;
    private String groupBy;
    private BigDecimal totalRevenue;
    private BigDecimal roomRevenue;
    private BigDecimal serviceRevenue;
    private BigDecimal discountTotal;
    private Integer paidBookingCount;
    private Integer pendingBookingCount;
    private Integer completedBookingCount;
    private Integer cancelledBookingCount;
    private Integer occupancyNights;
    private BigDecimal averageOrderValue;
    private List<HostRevenueTrendResponse> trends;
    private List<HostRevenueHomestayResponse> homestays;
    private List<HostRevenueBookingResponse> recentBookings;
}
