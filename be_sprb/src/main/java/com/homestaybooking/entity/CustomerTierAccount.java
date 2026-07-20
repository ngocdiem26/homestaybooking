package com.homestaybooking.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "customer_tier_accounts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerTierAccount {

    @Id
    @Column(name = "user_id")
    private Integer userId;

    @Column(name = "current_tier_id", nullable = false)
    private Integer currentTierId;

    @Column(name = "completed_bookings_24m", nullable = false)
    private Integer completedBookings24m;

    @Column(name = "tier_started_at")
    private LocalDateTime tierStartedAt;

    @Column(name = "last_calculated_at")
    private LocalDateTime lastCalculatedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
