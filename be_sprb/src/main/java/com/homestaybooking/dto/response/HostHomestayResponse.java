package com.homestaybooking.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HostHomestayResponse {

    private Integer homeId;
    private Integer ownerId;
    private String ownerName;
    private String homeName;
    private String homeAddress;
    private String province;
    private String city;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String homeDescription;
    private BigDecimal pricePerNight;
    private String status;
    private BigDecimal discountPercent;
    private Integer maxGuest;
    private BigDecimal ratingAvg;
    private Integer ratingCount;
    private Integer bedroomCount;
    private Integer bathroomCount;
    private Integer kitchenCount;
    private Integer livingRoomCount;
    private Integer bedCount;
    private LocalTime checkinTime;
    private LocalTime checkinEndTime;
    private LocalTime checkoutStartTime;
    private LocalTime checkoutTime;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    @Builder.Default
    private List<HostHomestayImageResponse> images = new ArrayList<>();
    @Builder.Default
    private List<String> amenities = new ArrayList<>();
    @Builder.Default
    private List<HostHomestayServiceResponse> services = new ArrayList<>();
    @Builder.Default
    private List<String> rules = new ArrayList<>();
}
