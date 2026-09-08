package com.homestaybooking.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HostHomestayServiceResponse {

    private Integer homestayServiceId;
    private Integer serviceId;
    private String serviceName;
    private String description;
    private BigDecimal price;
    private String pricingUnit;
    private String status;
}
