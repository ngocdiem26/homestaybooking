package com.homestaybooking.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HostHomestayServiceRequest {

    private Integer homestayServiceId;
    private Integer serviceId;
    private String serviceName;
    private String description;
    private BigDecimal price;
    private String pricingUnit;
    private String status;
}
