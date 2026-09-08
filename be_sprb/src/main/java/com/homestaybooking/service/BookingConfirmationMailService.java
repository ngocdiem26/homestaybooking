package com.homestaybooking.service;

import com.homestaybooking.dto.response.BookingListItemResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookingConfirmationMailService {
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final Locale VIETNAM = new Locale("vi", "VN");

    private final ObjectProvider<JavaMailSender> mailSenderProvider;

    @Value("${spring.mail.username:}")
    private String fromAddress;

    public boolean sendConfirmationMail(BookingListItemResponse booking, String trigger) {
        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender == null) {
            log.warn("Chưa cấu hình JavaMailSender nên bỏ qua email xác nhận booking {}.", booking == null ? null : booking.getBookingCode());
            return false;
        }
        if (booking == null) {
            log.warn("Không gửi email xác nhận vì booking null.");
            return false;
        }
        if (booking.getCustomerEmail() == null || booking.getCustomerEmail().isBlank()) {
            log.warn("Không gửi email xác nhận booking {} vì thiếu email khách hàng.", booking.getBookingCode());
            return false;
        }
        if (fromAddress == null || fromAddress.isBlank()) {
            log.warn("spring.mail.username đang rỗng nên không thể gửi email xác nhận booking {}.", booking.getBookingCode());
            return false;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(booking.getCustomerEmail());
            message.setSubject("Cozygo - Xác nhận đơn đặt phòng " + safe(booking.getBookingCode(), ""));
            message.setText(buildContent(booking, trigger));
            mailSender.send(message);
            log.info("Đã gửi email xác nhận booking {} đến {}", booking.getBookingCode(), booking.getCustomerEmail());
            return true;
        } catch (Exception exception) {
            log.error("Gửi email xác nhận booking {} đến {} thất bại: {}", booking.getBookingCode(), booking.getCustomerEmail(), exception.getMessage(), exception);
            return false;
        }
    }

    private String buildContent(BookingListItemResponse booking, String trigger) {
        String nl = System.lineSeparator();
        LocalDate cancelDeadline = booking.getCheckInDate() == null ? null : booking.getCheckInDate().minusDays(1);
        String triggerMessage = "PAYMENT_SUCCESS".equalsIgnoreCase(trigger)
                ? "Cozygo đã ghi nhận thanh toán thành công cho đơn đặt phòng của Quý khách."
                : "Chủ homestay đã xác nhận đơn đặt phòng của Quý khách.";

        return "Kính gửi " + safe(booking.getCustomerName(), "Quý khách") + "," + nl + nl
                + triggerMessage + nl + nl
                + "Thông tin đơn đặt phòng:" + nl
                + "- Mã đơn: " + safe(booking.getBookingCode(), "--") + nl
                + "- Homestay: " + safe(booking.getHomestayName(), "--") + nl
                + "- Địa chỉ: " + safe(booking.getHomestayAddress(), "--") + nl
                + "- Khu vực: " + safe(booking.getProvince(), "--") + nl
                + "- Ngày nhận phòng: " + formatDate(booking.getCheckInDate()) + nl
                + "- Ngày trả phòng: " + formatDate(booking.getCheckOutDate()) + nl
                + "- Số đêm: " + safeNumber(booking.getNumberOfNights()) + nl
                + "- Số khách: " + safeNumber(booking.getNumberOfGuest()) + nl
                + "- Tổng thanh toán: " + formatMoney(booking.getTotalPrice()) + nl
                + "- Phương thức thanh toán: " + paymentMethodLabel(booking.getPaymentMethod()) + nl
                + "- Trạng thái thanh toán: " + paymentStatusLabel(booking.getPaymentStatus()) + nl + nl
                + "Chính sách hủy đơn:" + nl
                + "- Quý khách chỉ được hủy đơn trước ngày nhận phòng ít nhất 1 ngày." + nl
                + "- Hạn hủy miễn phí của đơn này: " + (cancelDeadline == null ? "trước ngày nhận phòng 1 ngày" : formatDate(cancelDeadline)) + "." + nl
                + "- Từ ngày nhận phòng hoặc sau hạn trên, đơn không còn đủ điều kiện hủy trên hệ thống." + nl + nl
                + "Cảm ơn Quý khách đã tin chọn Cozygo. Chúc Quý khách có một chuyến đi thật trọn vẹn." + nl + nl
                + "Trân trọng," + nl
                + "Đội ngũ Cozygo";
    }

    private String paymentMethodLabel(String value) {
        String normalized = value == null ? "" : value.trim().toUpperCase(Locale.ROOT);
        if (normalized.contains("VNPAY") || normalized.equals("ONLINE")) return "Thanh toán online qua VNPAY";
        if (normalized.contains("PROPERTY") || normalized.contains("CASH") || normalized.contains("ONSITE")) return "Thanh toán tại homestay";
        return safe(value, "--");
    }

    private String paymentStatusLabel(String value) {
        String normalized = value == null ? "" : value.trim().toUpperCase(Locale.ROOT);
        if ("PAID".equals(normalized)) return "Đã thanh toán";
        if ("PENDING".equals(normalized)) return "Chờ thanh toán";
        if ("FAILED".equals(normalized)) return "Thanh toán thất bại";
        if ("REFUNDED".equals(normalized)) return "Đã hoàn tiền";
        return safe(value, "--");
    }

    private String formatDate(LocalDate value) {
        return value == null ? "--" : value.format(DATE_FORMATTER);
    }

    private String formatMoney(BigDecimal value) {
        BigDecimal amount = value == null ? BigDecimal.ZERO : value;
        return NumberFormat.getCurrencyInstance(VIETNAM).format(amount);
    }

    private String safeNumber(Integer value) {
        return value == null ? "--" : value.toString();
    }

    private String safe(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }
}