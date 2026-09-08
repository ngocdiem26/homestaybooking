package com.homestaybooking.controller;

import com.homestaybooking.dto.response.BookingPaymentStatusResponse;
import com.homestaybooking.exception.AppException;
import com.homestaybooking.service.BookingService;
import com.homestaybooking.service.VnpayService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.view.RedirectView;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/public/vnpay")
public class VnpayController {

    private final BookingService bookingService;
    private final VnpayService vnpayService;

    @PostMapping("/create-payment")
    public Map<String, String> createPayment(
            @RequestParam Long paymentId,
            @RequestParam BigDecimal amount,
            @RequestParam(required = false) String bookingCode,
            HttpServletRequest request
    ) {
        String orderInfo = "Thanh toan booking Cozygo " + (bookingCode == null || bookingCode.isBlank() ? paymentId : bookingCode.trim());
        String paymentUrl = vnpayService.createPaymentUrl(
                paymentId,
                amount,
                orderInfo,
                getClientIp(request)
        );
        return Map.of("paymentUrl", paymentUrl);
    }

    @GetMapping("/return")
    public RedirectView paymentReturn(@RequestParam Map<String, String> params) {
        try {
            BookingPaymentStatusResponse callbackResult = bookingService.handleVnpayReturn(params);

            // Đọc lại DB sau khi transaction callback đã commit để tránh snapshot cũ
            // khi IPN và Return đến gần như đồng thời.
            BookingPaymentStatusResponse result = bookingService.getPaymentStatus(callbackResult.getBookingId());

            boolean paid = "PAID".equalsIgnoreCase(result.getPaymentStatus());
            return new RedirectView(vnpayService.frontendCheckoutResultUrl(
                    paid ? "success" : "failed",
                    result.getHomeId(),
                    String.valueOf(result.getBookingId()),
                    result.getBookingCode(),
                    result.getBookingStatus(),
                    result.getPaymentStatus(),
                    paid ? "Thanh toán VNPAY thành công" : "Thanh toán VNPAY chưa hoàn tất"
            ));
        } catch (AppException exception) {
            String status = isInvalidSignature(exception) ? "invalid-signature" : "failed";
            return new RedirectView(vnpayService.frontendCheckoutResultUrl(
                    status,
                    null,
                    params.get("vnp_TxnRef"),
                    params.get("vnp_TxnRef"),
                    null,
                    null,
                    exception.getMessage()
            ));
        }
    }

    @GetMapping("/ipn")
    public Map<String, String> ipn(@RequestParam Map<String, String> params) {
        try {
            bookingService.handleVnpayIpn(params);
            return Map.of("RspCode", "00", "Message", "Confirm Success");
        } catch (AppException exception) {
            if (isInvalidSignature(exception)) {
                return Map.of("RspCode", "97", "Message", "Invalid signature");
            }
            return Map.of("RspCode", "99", "Message", exception.getMessage() == null ? "Unknown error" : exception.getMessage());
        }
    }

    private boolean isInvalidSignature(AppException exception) {
        String message = exception.getMessage() == null ? "" : exception.getMessage().toLowerCase();
        return message.contains("invalid_signature") || message.contains("signature") || message.contains("chu ky") || message.contains("chữ ký");
    }

    private String getClientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}