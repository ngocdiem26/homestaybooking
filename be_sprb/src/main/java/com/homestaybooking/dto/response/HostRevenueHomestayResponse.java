package com.homestaybooking.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class HostRevenueHomestayResponse {
    private Integer homeId;
    private String homestayName;
    private String province;
    private Integer bookingCount;
    private Integer completedCount;
    private BigDecimal revenue;
    private BigDecimal roomRevenue;
    private BigDecimal serviceRevenue;
    private BigDecimal averageRating;
}
