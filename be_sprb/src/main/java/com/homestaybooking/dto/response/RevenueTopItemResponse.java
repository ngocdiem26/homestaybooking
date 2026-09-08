package com.homestaybooking.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class RevenueTopItemResponse {
    private Integer id;
    private String name;
    private String subLabel;
    private BigDecimal commissionRevenue;
    private BigDecimal hostReceivableAmount;
    private Integer bookingCount;
}
