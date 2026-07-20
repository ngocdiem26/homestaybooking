package com.homestaybooking.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicHomestayResponse {

    private Integer id;
    private Integer homeId;
    private String code;
    private String name;
    private String homeName;
    private String address;
    private String homeAddress;
    private String city;
    private String province;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private Double distanceKm;
    private String location;
    private String description;
    private String homeDescription;
    private BigDecimal pricePerNight;
    private String price;
    private String oldPrice;
    private String status;
    private BigDecimal discountPercent;
    private Integer maxGuest;
    private BigDecimal rating;
    private BigDecimal ratingAvg;
    private Integer reviewCount;
    private Integer reviewsCount;
    private String score;
    private String reviewText;
    private Integer bedroomCount;
    private Integer bathroomCount;
    private Integer kitchenCount;
    private Integer livingRoomCount;
    private Integer bedCount;
    private LocalTime checkinTime;
    private LocalTime checkoutTime;
    private String roomType;
    private String details;
    private String beds;
    private String distance;
    private String alert;
    private Boolean unavailable;
    private Boolean dateRangeBooked;
    private String availabilityMessage;
    private Integer orders;
    private String tax;
    private String img;
    private String ownerName;
    private LocalDateTime createdAt;
    @Builder.Default
    private List<PublicHomestayImageResponse> images = new ArrayList<>();
    @Builder.Default
    private List<String> amenities = new ArrayList<>();
    @Builder.Default
    private List<String> services = new ArrayList<>();
    @Builder.Default
    private List<PublicHomestayServiceResponse> serviceItems = new ArrayList<>();
    @Builder.Default
    private List<String> rules = new ArrayList<>();
}
