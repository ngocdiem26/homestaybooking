package com.homestaybooking.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HostAvailabilityUpdateRequest {
    private Integer homeId;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
}
