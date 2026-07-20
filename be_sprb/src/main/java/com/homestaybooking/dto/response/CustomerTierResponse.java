package com.homestaybooking.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerTierResponse {

    private Integer userId;
    private String fullName;
    private String avatarUrl;
    private Integer currentTierId;
    private String currentTierCode;
    private String currentTierName;
    private Integer completedBookings24m;
    private Integer currentTierMinBookings;
    private Integer nextTierId;
    private String nextTierCode;
    private String nextTierName;
    private Integer nextTierMinBookings;
    private Integer remainingBookingsToNextTier;
    private Integer progressPercent;
    private LocalDateTime tierStartedAt;
    private LocalDateTime lastCalculatedAt;
}
