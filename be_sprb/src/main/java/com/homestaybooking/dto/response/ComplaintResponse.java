package com.homestaybooking.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class ComplaintResponse {
    private Integer complaintId;
    private String complaintCode;
    private Integer bookingId;
    private String bookingCode;
    private Integer homeId;
    private String homestayName;
    private String province;
    private Integer customerId;
    private String customerName;
    private String customerEmail;
    private Integer hostId;
    private String hostName;
    private String title;
    private String description;
    private String status;
    private String statusLabel;
    private String reply;
    private Boolean mailSent;
    private BigDecimal totalAmount;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private LocalDateTime createdAt;
}
