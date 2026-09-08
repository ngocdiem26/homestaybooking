package com.homestaybooking.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HostAvailabilityCalendarResponse {
    private Integer homeId;
    private String homeName;
    private LocalDate fromDate;
    private LocalDate toDate;
    @Builder.Default
    private List<HostAvailabilityDayResponse> days = new ArrayList<>();
}
