package com.homestaybooking.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HostHomestayRequest {

    private Integer ownerId;
    private String homeName;
    private String homeAddress;
    private String province;
    private String city;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String homeDescription;
    private BigDecimal pricePerNight;
    private BigDecimal discountPercent;
    private Integer maxGuest;
    private Integer bedroomCount;
    private Integer bathroomCount;
    private Integer kitchenCount;
    private Integer livingRoomCount;
    private Integer bedCount;
    private LocalTime checkinTime;
    private LocalTime checkinEndTime;
    private LocalTime checkoutStartTime;
    private LocalTime checkoutTime;
    private List<HostHomestayImageRequest> images = new ArrayList<>();
    private List<String> amenities = new ArrayList<>();
    private List<HostHomestayServiceRequest> services = new ArrayList<>();
    private List<String> rules = new ArrayList<>();
}
