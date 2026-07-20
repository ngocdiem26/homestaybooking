package com.homestaybooking.dto.request;

import lombok.Data;

@Data
public class BookingServiceSelectionRequest {
    private Integer homestayServiceId;
    private Integer quantity;
}
