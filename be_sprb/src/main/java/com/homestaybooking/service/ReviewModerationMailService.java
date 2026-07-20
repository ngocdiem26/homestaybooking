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
            log.error("Cannot send review moderation mail for review {}: {}", review.getReviewId(), exception.getMessage(), exception);
        }
    }

    private String subject(ReviewResponse review) {
        if ("HIDDEN".equalsIgnoreCase(review.getReviewStatus())) {
            return "[Cozygo][Cần xem xét] Đánh giá đã được ẩn tạm thời";
        }
        if ("AI_ERROR".equalsIgnoreCase(review.getModerationStatus())) {
            return "[Cozygo] Đánh giá dùng rule-based fallback cần kiểm tra";
        }
        return "[Cozygo] Có đánh giá cần admin xem xét";
    }

    private String content(ReviewResponse review) {
        String nl = System.lineSeparator();
        return "Cozygo phát hiện một đánh giá cần admin xem xét." + nl + nl
                + "- Review ID: " + review.getReviewId() + nl
                + "- Homestay: " + review.getHomestayName() + nl
                + "- Host: " + review.getHostName() + nl
                + "- Khách hàng: " + review.getCustomerName() + " <" + review.getCustomerEmail() + ">" + nl
                + "- Rating: " + review.getRating() + nl
                + "- Comment: " + review.getComment() + nl
                + "- Review status: " + review.getReviewStatus() + nl
                + "- Admin status: " + review.getAdminReviewStatus() + nl
                + "- Action: " + review.getModerationAction() + nl
                + "- Reason: " + friendlyReason(review) + nl
                + "- AI status: " + safe(review.getModerationStatus()) + nl
                + aiNote(review, nl)
                + "- finalScore: " + review.getFinalScore() + nl
                + "- toxicityScore: " + review.getToxicityScore() + nl
                + "- profanityScore: " + review.getProfanityScore() + nl
                + "- insultScore: " + review.getInsultScore() + nl
                + "- threatScore: " + review.getThreatScore() + nl
                + "- deathRelatedScore: " + review.getDeathRelatedScore() + nl + nl
                + "Link xử lý: http://localhost:5173/admin/reviews?reviewId=" + review.getReviewId();
    }

    private String friendlyReason(ReviewResponse review) {
        if ("AI_ERROR".equalsIgnoreCase(review.getModerationStatus())) {
            if ("HIDDEN".equalsIgnoreCase(review.getReviewStatus())) {
                return "Rule-based phát hiện nội dung nguy hiểm nên đánh giá đã bị ẩn tạm thời để admin xem xét.";
            }
            return "AI không đọc được kết quả hợp lệ nên hệ thống đã dùng rule-based fallback để xử lý đánh giá.";
        }
        String reason = review.getModerationReason();
        if (reason == null || reason.isBlank()) return "Đánh giá cần admin xem xét.";
        if (looksTechnical(reason)) return "AI không đọc được kết quả hợp lệ nên hệ thống đã dùng rule-based fallback để xử lý đánh giá.";
        return reason;
    }

    private String aiNote(ReviewResponse review, String nl) {
        if (!"AI_ERROR".equalsIgnoreCase(review.getModerationStatus())) return "";
        return "- AI note: Không đọc được kết quả AI, hệ thống đã dùng rule-based fallback." + nl;
    }

    private boolean looksTechnical(String value) {
        String lower = value.toLowerCase();
        return lower.contains("cannot parse")
                || lower.contains("exception")
                || lower.contains("unexpected")
                || lower.contains("json")
                || lower.contains("stack trace");
    }

    private String safe(String value) {
        return value == null || value.isBlank() ? "NONE" : value;
    }
}