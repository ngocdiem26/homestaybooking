package com.homestaybooking.service;

import com.homestaybooking.dto.response.ComplaintResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ComplaintMailService {
    private final ObjectProvider<JavaMailSender> mailSenderProvider;

    @Value("${spring.mail.username:}")
    private String fromAddress;

    public boolean sendResolutionMail(ComplaintResponse complaint, String reply) {
        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender == null || complaint == null || complaint.getCustomerEmail() == null || complaint.getCustomerEmail().isBlank()) {
            return false;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            if (fromAddress != null && !fromAddress.isBlank()) {
                message.setFrom(fromAddress);
            }
            message.setTo(complaint.getCustomerEmail());
            message.setSubject("Cozygo - Phản hồi khiếu nại " + complaint.getComplaintCode());
            message.setText(buildMailContent(complaint, reply));
            mailSender.send(message);
            return true;
        } catch (Exception ignored) {
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
