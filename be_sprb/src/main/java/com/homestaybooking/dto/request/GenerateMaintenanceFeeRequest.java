package com.homestaybooking.dto.request;

import lombok.Data;

@Data
public class GenerateMaintenanceFeeRequest {
    private Integer year;
    private Integer month;
}
