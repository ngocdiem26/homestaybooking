package com.homestaybooking.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Getter
@Builder
public class AdminHomestayResponse {

    private Integer homeId;
    private String homeName;
    private String homeAddress;
    private String province;
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
    private LocalTime checkoutTime;
    private String mainImage;
    private List<String> imageUrls;
    private Integer ownerId;
    private String ownerName;
    private String ownerEmail;
    private String ownerPhone;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
