package com.homestaybooking.dto.request;

import lombok.Data;

@Data
public class CreateComplaintRequest {
    private Integer bookingId;
    private String title;
    private String description;
}
