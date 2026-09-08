package com.homestaybooking.dto.request;

import lombok.Data;

@Data
public class PaidOutRequest {
    private String payoutReference;
    private String adminNote;
}
