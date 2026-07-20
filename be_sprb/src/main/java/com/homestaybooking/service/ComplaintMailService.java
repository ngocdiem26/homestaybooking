package com.homestaybooking.service;

import com.homestaybooking.dto.response.ComplaintResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class ComplaintMailService {
    private final ObjectProvider<JavaMailSender> mailSenderProvider;

    @Value("${spring.mail.username:}")
    private String fromAddress;

    public boolean sendResolutionMail(ComplaintResponse complaint, String reply) {
        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();

        if (mailSender == null) {
            log.error("Không tìm thấy JavaMailSender. Kiểm tra spring-boot-starter-mail trong pom.xml và cấu hình spring.mail.");
            return false;
        }

        if (complaint == null) {
            log.error("Không gửi được mail vì complaint null.");
            return false;
        }

        if (complaint.getCustomerEmail() == null || complaint.getCustomerEmail().isBlank()) {
            log.error("Không gửi được mail vì khiếu nại {} không có email khách hàng.", complaint.getComplaintCode());
            return false;
        }

        if (fromAddress == null || fromAddress.isBlank()) {
            log.error("spring.mail.username đang rỗng. Kiểm tra MAIL_USERNAME trong .env.");
            return false;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(complaint.getCustomerEmail());
            message.setSubject("Cozygo - Phản hồi khiếu nại " + complaint.getComplaintCode());
            message.setText(buildMailContent(complaint, reply));

            mailSender.send(message);

            log.info(
                    "Đã gửi email phản hồi khiếu nại {} đến {}",
                    complaint.getComplaintCode(),
                    complaint.getCustomerEmail()
            );

            return true;
        } catch (Exception exception) {
            log.error(
                    "Gửi email phản hồi khiếu nại {} đến {} thất bại. Lỗi: {}",
                    complaint.getComplaintCode(),
                    complaint.getCustomerEmail(),
                    exception.getMessage(),
                    exception
            );
            return false;
        }
    }

    public boolean sendTestMail(String toEmail) {
        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();

        if (mailSender == null) {
            log.error("Không tìm thấy JavaMailSender khi gửi email test.");
            return false;
        }

        if (toEmail == null || toEmail.isBlank()) {
            log.error("Email nhận test đang rỗng.");
            return false;
        }

        if (fromAddress == null || fromAddress.isBlank()) {
            log.error("spring.mail.username đang rỗng. Kiểm tra MAIL_USERNAME trong .env.");
            return false;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(toEmail);
            message.setSubject("Cozygo - Test gửi email");
            message.setText("Đây là email test từ hệ thống Cozygo/HomestayBooking.");

            mailSender.send(message);

            log.info("Đã gửi email test đến {}", toEmail);
            return true;
        } catch (Exception exception) {
            log.error("Gửi email test thất bại. Lỗi: {}", exception.getMessage(), exception);
            return false;
        }
    }

    private String buildMailContent(ComplaintResponse complaint, String reply) {
        String nl = System.lineSeparator();

        return "Kính gửi " + valueOrDefault(complaint.getCustomerName(), "Quý khách") + "," + nl + nl
                + "Cozygo đã tiếp nhận và xử lý khiếu nại của Quý khách với thông tin như sau:" + nl
                + "- Mã khiếu nại: " + complaint.getComplaintCode() + nl
                + "- Mã đơn đặt phòng: " + complaint.getBookingCode() + nl
                + "- Homestay: " + valueOrDefault(complaint.getHomestayName(), "Không xác định") + nl
                + "- Nội dung khiếu nại: " + valueOrDefault(complaint.getTitle(), "Khiếu nại đặt phòng") + nl + nl
                + "Kết quả xử lý từ bộ phận quản trị Cozygo:" + nl
                + reply + nl + nl
                + "Nếu Quý khách cần bổ sung thêm thông tin, vui lòng phản hồi lại email này hoặc liên hệ bộ phận hỗ trợ Cozygo." + nl + nl
                + "Trân trọng," + nl
                + "Bộ phận hỗ trợ khách hàng Cozygo";
    }

    private String valueOrDefault(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }
}