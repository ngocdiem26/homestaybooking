package com.homestaybooking.service;

import com.homestaybooking.dto.response.PlatformFeeSettingResponse;
import com.homestaybooking.exception.AppException;
import com.homestaybooking.repository.RevenueJdbcRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.Locale;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class BookingCommissionService {
    private final RevenueJdbcRepository revenueRepository;

    @Transactional(readOnly = true)
    public PlatformFeeSettingResponse getActiveFeeSetting(LocalDate date) {
        return revenueRepository.getActiveFeeSetting(date == null ? LocalDate.now() : date);
    }

    @Transactional
    public void createOrUpdatePendingCommission(Integer bookingId) {
        RevenueJdbcRepository.BookingMoneySource source = revenueRepository.loadBookingMoneySource(bookingId);
        if (source.getBookingAmount() == null || source.getBookingAmount().compareTo(BigDecimal.ZERO) <= 0) return;
        if (!isPayAtProperty(source) && !hasCollectedMoney(source.getPaymentStatus()) && !hasCollectedMoney(source.getLatestPaymentStatus())) return;
        RevenueJdbcRepository.CommissionRow existing = revenueRepository.findCommissionByBookingId(bookingId);
        if (existing != null && !RevenueStatus.PENDING.equals(RevenueStatus.normalize(existing.getCommissionStatus()))) return;
        PlatformFeeSettingResponse setting = getActiveFeeSetting(LocalDate.now());
        BigDecimal rate = setting.getCommissionRate() == null ? BigDecimal.ZERO : setting.getCommissionRate().setScale(2, RoundingMode.HALF_UP);
        BigDecimal retained = money(source.getBookingAmount());
        BigDecimal commission = retained.multiply(rate).divide(BigDecimal.valueOf(100), 0, RoundingMode.HALF_UP);
        BigDecimal hostReceivable = retained.subtract(commission).max(BigDecimal.ZERO).setScale(0, RoundingMode.HALF_UP);
        if (existing == null) {
            revenueRepository.insertPendingCommission(source, rate, commission, hostReceivable);
        } else {
            revenueRepository.updatePendingCommission(bookingId, source.getHostId(), retained, rate, commission, hostReceivable);
        }
    }
    @Transactional
    public void recognizeCommission(Integer bookingId) {
        RevenueJdbcRepository.BookingMoneySource source = revenueRepository.loadBookingMoneySource(bookingId);
        String bookingStatus = RevenueStatus.normalize(source.getBookingStatus());
        if (!Set.of("COMPLETED", "NO_SHOW").contains(bookingStatus)) return;
        if (!isPayAtProperty(source) && !isPaid(source.getPaymentStatus()) && !isPaid(source.getLatestPaymentStatus())) return;
        createOrUpdatePendingCommission(bookingId);
        if ("NO_SHOW".equals(bookingStatus)) {
            markNoShow(bookingId);
            return;
        }
        revenueRepository.recognizeCommission(bookingId);
    }
    @Transactional
    public void cancelCommissionWithFullRefund(Integer bookingId, String cancellationType) {
        createOrUpdatePendingCommission(bookingId);
        RevenueJdbcRepository.CommissionRow current = revenueRepository.findCommissionByBookingId(bookingId);
        if (current == null) return;
        if (RevenueStatus.PAID_OUT.equals(RevenueStatus.normalize(current.getCommissionStatus()))) {
            throw new AppException("POST_PAYOUT_REFUND_REQUIRES_MANUAL_ADJUSTMENT");
        }
        BigDecimal refund = money(current.getBookingAmount());
        revenueRepository.updateCommissionRefund(bookingId, refund, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, normalizeCancellation(cancellationType), RevenueStatus.REFUNDED, RevenueStatus.CANCELLED, null);
    }

    @Transactional
    public void applyPartialRefund(Integer bookingId, BigDecimal refundAmount, String cancellationType, String adminNote) {
        createOrUpdatePendingCommission(bookingId);
        RevenueJdbcRepository.CommissionRow current = revenueRepository.findCommissionByBookingId(bookingId);
        if (current == null) throw new AppException("COMMISSION_NOT_FOUND");
        if (RevenueStatus.PAID_OUT.equals(RevenueStatus.normalize(current.getCommissionStatus()))) {
            throw new AppException("POST_PAYOUT_REFUND_REQUIRES_MANUAL_ADJUSTMENT");
        }
        BigDecimal refund = money(refundAmount);
        if (refund.compareTo(BigDecimal.ZERO) < 0 || refund.compareTo(current.getBookingAmount()) > 0) {
            throw new AppException("INVALID_REFUND_AMOUNT");
        }
        BigDecimal retained = current.getBookingAmount().subtract(refund).max(BigDecimal.ZERO).setScale(0, RoundingMode.HALF_UP);
        BigDecimal commission = retained.multiply(current.getCommissionRate()).divide(BigDecimal.valueOf(100), 0, RoundingMode.HALF_UP);
        BigDecimal hostReceivable = retained.subtract(commission).max(BigDecimal.ZERO).setScale(0, RoundingMode.HALF_UP);
        String commissionStatus = retained.compareTo(BigDecimal.ZERO) > 0 ? RevenueStatus.RECOGNIZED : RevenueStatus.CANCELLED;
        String refundStatus = retained.compareTo(BigDecimal.ZERO) > 0 ? RevenueStatus.PARTIALLY_REFUNDED : RevenueStatus.REFUNDED;
        revenueRepository.updateCommissionRefund(bookingId, refund, retained, commission, hostReceivable, normalizeCancellation(cancellationType), refundStatus, commissionStatus, adminNote);
    }

    @Transactional
    public void markNoShow(Integer bookingId) {
        createOrUpdatePendingCommission(bookingId);
        RevenueJdbcRepository.CommissionRow current = revenueRepository.findCommissionByBookingId(bookingId);
        if (current == null) return;
        revenueRepository.updateCommissionRefund(bookingId, BigDecimal.ZERO, current.getBookingAmount(), current.getCommissionAmount(), current.getHostReceivableAmount(), RevenueStatus.NO_SHOW, RevenueStatus.NONE, RevenueStatus.RECOGNIZED, null);
    }

    @Transactional
    public void markPaidOut(Long commissionId, String payoutReference, String adminNote) {
        RevenueJdbcRepository.CommissionRow current = revenueRepository.findCommissionById(commissionId);
        if (!RevenueStatus.RECOGNIZED.equals(RevenueStatus.normalize(current.getCommissionStatus()))) throw new AppException("COMMISSION_NOT_READY_FOR_PAYOUT");
        if (current.getHostReceivableAmount().compareTo(BigDecimal.ZERO) <= 0) throw new AppException("INVALID_PAYOUT_AMOUNT");
        int updated = revenueRepository.markPaidOut(commissionId, payoutReference, adminNote);
        if (updated == 0) throw new AppException("COMMISSION_PAYOUT_ALREADY_HANDLED");
    }

    private boolean isPaid(String status) { return Set.of("PAID", "SUCCESS", "COMPLETED", "DA_THANH_TOAN").contains(RevenueStatus.normalize(status)); }
    private boolean hasCollectedMoney(String status) { return Set.of("PAID", "SUCCESS", "COMPLETED", "DA_THANH_TOAN", "REFUNDED").contains(RevenueStatus.normalize(status)); }
    private boolean isPayAtProperty(RevenueJdbcRepository.BookingMoneySource source) { return "PAY_AT_PROPERTY".equals(RevenueStatus.normalize(source.getPaymentMethod())); }
    private String normalizeCancellation(String value) {
        String normalized = value == null || value.isBlank() ? RevenueStatus.FREE_CANCELLATION : value.trim().toUpperCase(Locale.ROOT);
        if (!Set.of(RevenueStatus.FREE_CANCELLATION, RevenueStatus.LATE_CANCELLATION, RevenueStatus.HOST_CANCELLATION, RevenueStatus.NO_SHOW).contains(normalized)) return RevenueStatus.FREE_CANCELLATION;
        return normalized;
    }
    private BigDecimal money(BigDecimal value) { return (value == null ? BigDecimal.ZERO : value).setScale(0, RoundingMode.HALF_UP); }
}

