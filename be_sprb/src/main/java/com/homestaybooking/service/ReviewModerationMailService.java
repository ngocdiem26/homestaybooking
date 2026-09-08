package com.homestaybooking.service;

import com.homestaybooking.dto.response.ReviewResponse;
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
public class ReviewModerationMailService {
    private final ObjectProvider<JavaMailSender> mailSenderProvider;

    @Value("${spring.mail.username:}")
    private String fromAddress;

    @Value("${cozygo.admin.email:}")
    private String configuredAdminEmail;

    public void notifyAdmin(ReviewResponse review) {
        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender == null || review == null) return;
        String adminEmail = configuredAdminEmail == null || configuredAdminEmail.isBlank() ? fromAddress : configuredAdminEmail;
        if (adminEmail == null || adminEmail.isBlank() || fromAddress == null || fromAddress.isBlank()) return;

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(adminEmail);
            message.setSubject(subject(review));
            message.setText(content(review));
            mailSender.send(message);
        } catch (Exception exception) {
            log.error("Cannot send review moderation mail for review {}: {}", review.getReviewId(), exception.getMessage());
        }
    }

    private String subject(ReviewResponse review) {
        if ("HIDDEN".equalsIgnoreCase(review.getReviewStatus())) {
            return "[Cozygo][Khẩn cấp] Đánh giá bị ẩn do nội dung nguy hiểm";
        }
        return "[Cozygo] Có đánh giá cần xem xét";
    }

    private String content(ReviewResponse review) {
        String nl = System.lineSeparator();
        return "Cozygo ghi nhận một đánh giá cần admin xem xét." + nl + nl
                + "- Review ID: " + safe(review.getReviewId()) + nl
                + "- Homestay: " + safe(review.getHomestayName()) + nl
                + "- Host: " + safe(review.getHostName()) + nl
                + "- Khách hàng: " + safe(review.getCustomerName()) + " <" + safe(review.getCustomerEmail()) + ">" + nl
                + "- Rating: " + safe(review.getRating()) + nl
                + "- Nội dung: " + safe(review.getComment()) + nl
                + "- Review status: " + safe(review.getReviewStatus()) + nl
                + "- Admin status: " + safe(review.getAdminReviewStatus()) + nl
                + "- Action: " + safe(review.getModerationAction()) + nl
                + "- Lý do: " + friendlyReason(review) + nl
                + "- Final score: " + safe(review.getFinalScore()) + nl
                + "- Threat score: " + safe(review.getThreatScore()) + nl
                + "- Hate score: " + safe(review.getHateScore()) + nl
                + "- Privacy score: " + safe(review.getPrivacyScore()) + nl
                + "- Spam score: " + safe(review.getSpamScore()) + nl + nl
                + "Link xử lý: http://localhost:5173/admin/reviews?reviewId=" + safe(review.getReviewId()) + nl + nl
                + "Vui lòng kiểm tra nội dung và đưa ra quyết định cuối cùng trên trang quản trị Cozygo.";
    }

    private String friendlyReason(ReviewResponse review) {
        String reason = review.getModerationReason();
        if (reason == null || reason.isBlank() || looksTechnical(reason)) {
            return "Đánh giá cần admin xem xét theo chính sách nội dung của Cozygo.";
        }
        return reason;
    }

    private boolean looksTechnical(String value) {
        String lower = value.toLowerCase();
        return lower.contains("exception")
                || lower.contains("stacktrace")
                || lower.contains("json")
                || lower.contains("sql")
                || lower.contains("openai_api_key")
                || lower.contains("authorization");
    }

    private String safe(Object value) {
        return value == null ? "N/A" : String.valueOf(value);
    }
}
