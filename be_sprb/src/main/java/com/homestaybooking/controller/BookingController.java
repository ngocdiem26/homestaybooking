package com.homestaybooking.controller;

import com.homestaybooking.dto.request.BookingCreateRequest;
import com.homestaybooking.dto.request.BookingQuoteRequest;
import com.homestaybooking.dto.request.SepayWebhookRequest;
import com.homestaybooking.dto.request.UpdateBookingStatusRequest;
import com.homestaybooking.dto.response.BookingListItemResponse;
import com.homestaybooking.dto.response.BookingPaymentStatusResponse;
import com.homestaybooking.dto.response.BookingPriceQuoteResponse;
import com.homestaybooking.dto.response.BookingResponse;
import com.homestaybooking.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @GetMapping("/me")
    public List<BookingListItemResponse> getMyBookings(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        return bookingService.getMyBookings(authorizationHeader);
    }

    @PatchMapping("/me/{bookingId}/cancel")
    public BookingListItemResponse cancelMyBooking(
            @PathVariable Integer bookingId,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        return bookingService.cancelMyBooking(bookingId, authorizationHeader);
    }

    @GetMapping("/host")
    public List<BookingListItemResponse> getHostBookings(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        return bookingService.getHostBookings(authorizationHeader);
    }

    @GetMapping("/admin")
    public List<BookingListItemResponse> getAdminBookings(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        return bookingService.getAdminBookings(authorizationHeader);
    }

    @PatchMapping("/admin/{bookingId}/status")
    public BookingListItemResponse updateAdminBookingStatus(
            @PathVariable Integer bookingId,
            @RequestBody UpdateBookingStatusRequest request,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        return bookingService.updateAdminBookingStatus(bookingId, request.getStatus(), authorizationHeader);
    }

    @PatchMapping("/admin/{bookingId}/payment/confirm")
    public BookingListItemResponse confirmAdminBookingPayment(
            @PathVariable Integer bookingId,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        return bookingService.confirmAdminBookingPayment(bookingId, authorizationHeader);
    }

    @PatchMapping("/host/{bookingId}/status")
    public BookingListItemResponse updateHostBookingStatus(
            @PathVariable Integer bookingId,
            @RequestBody UpdateBookingStatusRequest request,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        return bookingService.updateHostBookingStatus(bookingId, request.getStatus(), authorizationHeader);
    }

    @PatchMapping("/host/{bookingId}/payment/confirm")
    public BookingListItemResponse confirmHostBookingPayment(
            @PathVariable Integer bookingId,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        return bookingService.confirmHostBookingPayment(bookingId, authorizationHeader);
    }

    @PostMapping("/quote")
    public BookingPriceQuoteResponse quote(
            @RequestBody BookingQuoteRequest request,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        return bookingService.quote(request, authorizationHeader);
    }

    @PostMapping
    public BookingResponse createBooking(
            @RequestBody BookingCreateRequest request,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        return bookingService.createBooking(request, authorizationHeader);
    }

    @GetMapping("/{bookingId}/payment-status")
    public BookingPaymentStatusResponse getPaymentStatus(@PathVariable Integer bookingId) {
        return bookingService.getPaymentStatus(bookingId);
    }

    @PostMapping("/sepay/webhook")
    public BookingPaymentStatusResponse sepayWebhook(@RequestBody SepayWebhookRequest request) {
        return bookingService.handleSepayWebhook(request);
    }
}
