package com.homestaybooking.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "homestays")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Homestay {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "home_id")
    private Integer homeId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User owner;

    @Column(name = "home_name", nullable = false)
    private String homeName;

    @Column(name = "home_address", nullable = false)
    private String homeAddress;

    @Column(name = "province", nullable = false, length = 100)
    private String province;

    @Column(name = "city", length = 100)
    private String city;

    @Column(name = "latitude", precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 10, scale = 7)
    private BigDecimal longitude;

    @Column(name = "home_description")
    private String homeDescription;

    @Column(name = "price_per_night", nullable = false)
    private BigDecimal pricePerNight;

    @Column(name = "status", nullable = false, length = 50)
    private String status;

    @Column(name = "discount_percent")
    private BigDecimal discountPercent;

    @Column(name = "max_guest", nullable = false)
    private Integer maxGuest;

    @Column(name = "rating_avg")
    private BigDecimal ratingAvg;

    @Column(name = "rating_count")
    private Integer ratingCount;

    @Column(name = "bedroom_count", nullable = false)
    private Integer bedroomCount;

    @Column(name = "bathroom_count", nullable = false)
    private Integer bathroomCount;

    @Column(name = "kitchen_count", nullable = false)
    private Integer kitchenCount;

    @Column(name = "living_room_count", nullable = false)
    private Integer livingRoomCount;

    @Column(name = "bed_count", nullable = false)
    private Integer bedCount;

    @Column(name = "checkin_time", nullable = false)
    private LocalTime checkinTime;

    @Column(name = "checkout_time", nullable = false)
    private LocalTime checkoutTime;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @OneToMany(mappedBy = "homestay", fetch = FetchType.LAZY)
    @OrderBy("isMain DESC, sortOrder ASC, imageId ASC")
    @Builder.Default
    private List<HomestayImage> images = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        if (status == null) {
            status = "PENDING";
        }
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
