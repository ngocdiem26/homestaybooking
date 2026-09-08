package com.homestaybooking.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "itinerary_items")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItineraryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "item_id")
    private Long itemId;

    @Column(name = "itinerary_id", nullable = false)
    private Long itineraryId;

    @Transient
    private String itineraryCode;

    @Transient
    private Integer userId;

    @Transient
    private String itineraryTitle;

    @Transient
    private String destinationKeyword;

    @Transient
    private String city;

    @Transient
    private String province;

    @Transient
    private LocalDate startDate;

    @Transient
    private LocalDate endDate;

    @Transient
    private Integer totalDays;

    @Transient
    private Integer travelerCount;

    @Transient
    private String travelStyle;

    @Transient
    private String pace;

    @Transient
    private String itinerarySummary;

    @Column(name = "day_number", nullable = false)
    private Integer dayNumber;

    @Column(name = "start_time")
    private LocalTime startTime;

    @Column(name = "end_time")
    private LocalTime endTime;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Column(name = "preferred_time_of_day", length = 30)
    private String preferredTimeOfDay;

    @Column(name = "fixed_time", nullable = false)
    private Boolean fixedTime;

    @Column(name = "title", nullable = false)
    private String title;

    @Transient
    private String locationName;

    @Column(name = "address")
    private String address;

    @Column(name = "item_type", length = 30)
    private String itemType;

    @Column(name = "source_type", nullable = false, length = 30)
    private String sourceType;

    @Column(name = "activity_id")
    private Integer activityId;

    @Transient
    private Integer homestayId;

    @Transient
    private Long sourceId;

    @Column(name = "latitude", precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 10, scale = 7)
    private BigDecimal longitude;

    @Column(name = "estimated_cost", precision = 12, scale = 2)
    private BigDecimal estimatedCost;

    @Column(name = "transport_note")
    private String transportNote;

    @Column(name = "note")
    private String note;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder;

    @Transient
    private String rawUserRequest;

    @Transient
    private String rawAiResponse;

    @Transient
    private String itineraryStatus;

    @Transient
    private String generationStatus;

    @Transient
    private LocalDateTime createdAt;

    @Transient
    private LocalDateTime updatedAt;
}
