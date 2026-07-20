package com.homestaybooking.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "loyalty_tiers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoyaltyTier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "tier_id")
    private Integer tierId;

    @Column(name = "tier_code", nullable = false, length = 50)
    private String tierCode;

    @Column(name = "tier_name", nullable = false, length = 100)
    private String tierName;

    @Column(name = "min_completed_bookings_24m", nullable = false)
    private Integer minCompletedBookings24m;

    @Column(name = "display_order")
    private Integer displayOrder;

    @Column(name = "tier_status", nullable = false, length = 30)
    private String tierStatus;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
