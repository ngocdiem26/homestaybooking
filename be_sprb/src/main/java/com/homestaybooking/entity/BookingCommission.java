package com.homestaybooking.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "booking_commissions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingCommission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "commission_id")
    private Long commissionId;

    @Column(name = "booking_id", nullable = false)
    private Integer bookingId;

    @Column(name = "host_id", nullable = false)
    private Integer hostId;

    @Column(name = "booking_amount", nullable = false, precision = 14, scale = 2)
    private BigDecimal bookingAmount;

    @Column(name = "refund_amount", nullable = false, precision = 14, scale = 2)
    private BigDecimal refundAmount;

    @Column(name = "retained_amount", nullable = false, precision = 14, scale = 2)
    private BigDecimal retainedAmount;

    @Column(name = "commission_rate", nullable = false, precision = 5, scale = 2)
    private BigDecimal commissionRate;

    @Column(name = "commission_amount", nullable = false, precision = 14, scale = 2)
    private BigDecimal commissionAmount;

    @Column(name = "host_receivable_amount", nullable = false, precision = 14, scale = 2)
    private BigDecimal hostReceivableAmount;

    @Column(name = "cancellation_type", length = 30)
    private String cancellationType;

    @Column(name = "refund_status", length = 30)
    private String refundStatus;

    @Column(name = "commission_status", nullable = false, length = 30)
    private String commissionStatus;

    @Column(name = "calculated_at")
    private LocalDateTime calculatedAt;

    @Column(name = "recognized_at")
    private LocalDateTime recognizedAt;

    @Column(name = "refunded_at")
    private LocalDateTime refundedAt;

    @Column(name = "paid_to_host_at")
    private LocalDateTime paidToHostAt;

    @Column(name = "payout_reference", length = 150)
    private String payoutReference;

    @Column(name = "admin_note", columnDefinition = "TEXT")
    private String adminNote;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
