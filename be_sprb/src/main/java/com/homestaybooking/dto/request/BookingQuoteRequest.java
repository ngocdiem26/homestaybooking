package com.homestaybooking.dto.request;

import lombok.Data;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
public class BookingQuoteRequest {
    private Integer homeId;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private Integer numberOfGuest;
    private String promotionCode;
    private List<BookingServiceSelectionRequest> services = new ArrayList<>();
}
