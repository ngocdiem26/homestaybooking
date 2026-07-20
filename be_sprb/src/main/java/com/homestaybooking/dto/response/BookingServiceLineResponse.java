package com.homestaybooking.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class BookingServiceLineResponse {
    private Integer homestayServiceId;
    private String serviceName;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
}
