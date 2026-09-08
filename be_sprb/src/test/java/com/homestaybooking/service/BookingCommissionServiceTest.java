package com.homestaybooking.service;

import com.homestaybooking.dto.response.PlatformFeeSettingResponse;
import com.homestaybooking.exception.AppException;
import com.homestaybooking.repository.RevenueJdbcRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingCommissionServiceTest {
    @Mock
    private RevenueJdbcRepository revenueRepository;

    @InjectMocks
    private BookingCommissionService service;

    @Test
    void paidBookingCreatesPendingCommissionWithTenPercent() {
        mockActiveRate("10.00");
        RevenueJdbcRepository.BookingMoneySource source = source(new BigDecimal("2000000"), "CONFIRMED", "PAID");
        when(revenueRepository.loadBookingMoneySource(1)).thenReturn(source);
        when(revenueRepository.findCommissionByBookingId(1)).thenReturn(null);

        service.createOrUpdatePendingCommission(1);

        verify(revenueRepository).insertPendingCommission(eq(source), eq(new BigDecimal("10.00")), eq(new BigDecimal("200000")), eq(new BigDecimal("1800000")));
    }

    @Test
    void completedBookingRecognizesPendingCommission() {
        mockActiveRate("10.00");
        when(revenueRepository.loadBookingMoneySource(1)).thenReturn(source(new BigDecimal("2000000"), "COMPLETED", "PAID"));
        when(revenueRepository.findCommissionByBookingId(1)).thenReturn(null);

        service.recognizeCommission(1);

        verify(revenueRepository).insertPendingCommission(any(), eq(new BigDecimal("10.00")), eq(new BigDecimal("200000")), eq(new BigDecimal("1800000")));
        verify(revenueRepository).recognizeCommission(1);
    }

    @Test
    void lateCancellationRecalculatesRetainedCommissionAndHostReceivable() {
        mockActiveRate("10.00");
        RevenueJdbcRepository.CommissionRow row = commission(new BigDecimal("2000000"), new BigDecimal("10.00"), "PENDING");
        when(revenueRepository.loadBookingMoneySource(1)).thenReturn(source(new BigDecimal("2000000"), "CANCELLED", "PAID"));
        when(revenueRepository.findCommissionByBookingId(1)).thenReturn(row);

        service.applyPartialRefund(1, new BigDecimal("1000000"), "LATE_CANCELLATION", "test");

        verify(revenueRepository).updateCommissionRefund(eq(1), eq(new BigDecimal("1000000")), eq(new BigDecimal("1000000")), eq(new BigDecimal("100000")), eq(new BigDecimal("900000")), eq("LATE_CANCELLATION"), eq("PARTIALLY_REFUNDED"), eq("RECOGNIZED"), eq("test"));
    }

    @Test
    void freeCancellationSetsZeroRevenue() {
        mockActiveRate("10.00");
        RevenueJdbcRepository.CommissionRow row = commission(new BigDecimal("2000000"), new BigDecimal("10.00"), "PENDING");
        when(revenueRepository.loadBookingMoneySource(1)).thenReturn(source(new BigDecimal("2000000"), "CANCELLED", "PAID"));
        when(revenueRepository.findCommissionByBookingId(1)).thenReturn(row);

        service.cancelCommissionWithFullRefund(1, "FREE_CANCELLATION");

        verify(revenueRepository).updateCommissionRefund(eq(1), eq(new BigDecimal("2000000")), eq(BigDecimal.ZERO), eq(BigDecimal.ZERO), eq(BigDecimal.ZERO), eq("FREE_CANCELLATION"), eq("REFUNDED"), eq("CANCELLED"), isNull());
    }

    @Test
    void noShowRecognizesFullBookingAmount() {
        mockActiveRate("10.00");
        RevenueJdbcRepository.CommissionRow row = commission(new BigDecimal("2000000"), new BigDecimal("10.00"), "PENDING");
        when(revenueRepository.loadBookingMoneySource(1)).thenReturn(source(new BigDecimal("2000000"), "NO_SHOW", "PAID"));
        when(revenueRepository.findCommissionByBookingId(1)).thenReturn(row);

        service.markNoShow(1);

        verify(revenueRepository).updateCommissionRefund(eq(1), eq(BigDecimal.ZERO), eq(new BigDecimal("2000000")), eq(new BigDecimal("200000.00")), eq(new BigDecimal("1800000.00")), eq("NO_SHOW"), eq("NONE"), eq("RECOGNIZED"), isNull());
    }

    @Test
    void refundAfterPaidOutRequiresManualAdjustment() {
        RevenueJdbcRepository.CommissionRow row = commission(new BigDecimal("2000000"), new BigDecimal("10.00"), "PAID_OUT");
        when(revenueRepository.loadBookingMoneySource(1)).thenReturn(source(new BigDecimal("2000000"), "CANCELLED", "PAID"));
        when(revenueRepository.findCommissionByBookingId(1)).thenReturn(row);

        AppException ex = assertThrows(AppException.class, () -> service.applyPartialRefund(1, new BigDecimal("1000000"), "LATE_CANCELLATION", null));
        assertEquals("POST_PAYOUT_REFUND_REQUIRES_MANUAL_ADJUSTMENT", ex.getMessage());
    }

    @Test
    void unpaidBookingDoesNotCreateCommission() {
        when(revenueRepository.loadBookingMoneySource(1)).thenReturn(source(new BigDecimal("2000000"), "PAYMENT_PENDING", "PENDING"));

        service.createOrUpdatePendingCommission(1);

        verify(revenueRepository, never()).getActiveFeeSetting(any(LocalDate.class));
        verify(revenueRepository, never()).insertPendingCommission(any(), any(), any(), any());
    }


    @Test
    void payAtPropertyCompletedBookingRecognizesCommissionWithoutOnlinePaidStatus() {
        mockActiveRate("10.00");
        RevenueJdbcRepository.BookingMoneySource source = RevenueJdbcRepository.BookingMoneySource.builder()
                .bookingId(1)
                .hostId(7)
                .bookingAmount(new BigDecimal("2000000"))
                .bookingStatus("COMPLETED")
                .paymentStatus("PENDING")
                .latestPaymentStatus("PENDING")
                .paymentMethod("PAY_AT_PROPERTY")
                .build();
        when(revenueRepository.loadBookingMoneySource(1)).thenReturn(source);
        when(revenueRepository.findCommissionByBookingId(1)).thenReturn(null);

        service.recognizeCommission(1);

        verify(revenueRepository).insertPendingCommission(eq(source), eq(new BigDecimal("10.00")), eq(new BigDecimal("200000")), eq(new BigDecimal("1800000")));
        verify(revenueRepository).recognizeCommission(1);
    }

    @Test
    void onlineCompletedBookingWithoutPaidStatusDoesNotRecognizeCommission() {
        RevenueJdbcRepository.BookingMoneySource source = RevenueJdbcRepository.BookingMoneySource.builder()
                .bookingId(1)
                .hostId(7)
                .bookingAmount(new BigDecimal("2000000"))
                .bookingStatus("COMPLETED")
                .paymentStatus("PENDING")
                .latestPaymentStatus("PENDING")
                .paymentMethod("VNPAY")
                .build();
        when(revenueRepository.loadBookingMoneySource(1)).thenReturn(source);

        service.recognizeCommission(1);

        verify(revenueRepository, never()).getActiveFeeSetting(any(LocalDate.class));
        verify(revenueRepository, never()).insertPendingCommission(any(), any(), any(), any());
        verify(revenueRepository, never()).recognizeCommission(anyInt());
    }

    @Test
    void recognizingAlreadyRecognizedBookingDoesNotInsertDuplicateCommission() {
        RevenueJdbcRepository.CommissionRow row = commission(new BigDecimal("2000000"), new BigDecimal("10.00"), "RECOGNIZED");
        when(revenueRepository.loadBookingMoneySource(1)).thenReturn(source(new BigDecimal("2000000"), "COMPLETED", "PAID"));
        when(revenueRepository.findCommissionByBookingId(1)).thenReturn(row);

        service.recognizeCommission(1);

        verify(revenueRepository, never()).insertPendingCommission(any(), any(), any(), any());
        verify(revenueRepository).recognizeCommission(1);
    }

    private void mockActiveRate(String rate) {
        when(revenueRepository.getActiveFeeSetting(any(LocalDate.class))).thenReturn(PlatformFeeSettingResponse.builder().commissionRate(new BigDecimal(rate)).monthlyMaintenanceFee(new BigDecimal("99000")).freeTrialDays(30).gracePeriodDays(3).build());
    }

    private RevenueJdbcRepository.BookingMoneySource source(BigDecimal amount, String bookingStatus, String paymentStatus) {
        return RevenueJdbcRepository.BookingMoneySource.builder().bookingId(1).hostId(7).bookingAmount(amount).bookingStatus(bookingStatus).paymentStatus(paymentStatus).latestPaymentStatus(paymentStatus).build();
    }

    private RevenueJdbcRepository.CommissionRow commission(BigDecimal bookingAmount, BigDecimal rate, String status) {
        BigDecimal commission = bookingAmount.multiply(rate).divide(BigDecimal.valueOf(100));
        return RevenueJdbcRepository.CommissionRow.builder().commissionId(11L).bookingId(1).commissionStatus(status).bookingAmount(bookingAmount).refundAmount(BigDecimal.ZERO).retainedAmount(bookingAmount).commissionRate(rate).commissionAmount(commission).hostReceivableAmount(bookingAmount.subtract(commission)).build();
    }
}
