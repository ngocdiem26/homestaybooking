package com.homestaybooking.repository;

import com.homestaybooking.dto.response.ReviewModerationLogResponse;
import com.homestaybooking.dto.response.ReviewModerationResult;
import com.homestaybooking.dto.response.ReviewResponse;
import com.homestaybooking.exception.AppException;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Repository
@RequiredArgsConstructor
public class ReviewJdbcRepository {
    private final JdbcTemplate jdbcTemplate;

    public List<ReviewResponse> findPublicReviews(Integer homeId) {
        return findReviews("where r.home_id = ? and r.review_status = 'VISIBLE'", "order by r.created_at desc", homeId);
    }

    public List<ReviewResponse> findFeaturedReviews(int limit) {
        return jdbcTemplate.query(reviewSelectSql("where r.review_status = 'VISIBLE'", "order by r.created_at desc limit ?"), this::mapReview, limit);
    }

    public List<ReviewResponse> findAdminReviews() {
        return findAdminReviews("ALL");
    }

    public List<ReviewResponse> findAdminReviews(String tab) {
        String normalized = tab == null ? "ALL" : tab.trim().toUpperCase();
        String whereClause = switch (normalized) {
            case "NEED_REVIEW", "PENDING" -> "where r.review_status = 'VISIBLE' and r.admin_review_status = 'PENDING'";
            case "AI_HIDDEN", "HIDDEN" -> "where r.review_status = 'HIDDEN' and r.admin_review_status = 'PENDING'";
            case "VISIBLE" -> "where r.review_status = 'VISIBLE'";
            case "RESOLVED" -> "where r.admin_review_status = 'RESOLVED'";
            case "REJECTED" -> "where r.review_status = 'REJECTED'";
            default -> "where r.review_status <> 'DELETED'";
        };
        return findReviews(whereClause, "order by r.created_at desc");
    }

    public Map<String, Integer> countAdminReviewTabs() {
        Map<String, Integer> counts = new LinkedHashMap<>();
        counts.put("all", countWhere("r.review_status <> 'DELETED'"));
        counts.put("needReview", countWhere("r.review_status = 'VISIBLE' and r.admin_review_status = 'PENDING'"));
        counts.put("aiHidden", countWhere("r.review_status = 'HIDDEN' and r.admin_review_status = 'PENDING'"));
        counts.put("visible", countWhere("r.review_status = 'VISIBLE'"));
        counts.put("resolved", countWhere("r.admin_review_status = 'RESOLVED'"));
        counts.put("rejected", countWhere("r.review_status = 'REJECTED'"));
        return counts;
    }

    private Integer countWhere(String condition) {
        Integer count = jdbcTemplate.queryForObject("select count(*) from reviews r where " + condition, Integer.class);
        return count == null ? 0 : count;
    }

    public List<ReviewResponse> findHostReviews(Integer hostId) {
        return findReviews("where h.user_id = ? and r.review_status <> 'DELETED'", "order by r.created_at desc", hostId);
    }

    public List<ReviewResponse> findUserReviews(Integer userId) {
        return findReviews("where r.user_id = ? and r.review_status <> 'DELETED'", "order by r.created_at desc", userId);
    }

    public ReviewResponse findById(Integer reviewId) {
        try {
            return jdbcTemplate.queryForObject(reviewSelectSql("where r.review_id = ?", ""), this::mapReview, reviewId);
        } catch (EmptyResultDataAccessException exception) {
            throw new AppException("Không tìm thấy đánh giá");
        }
    }

    public ReviewEligibilityInfo findEligibleBooking(Integer userId, Integer homeId) {
        List<ReviewEligibilityInfo> rows = jdbcTemplate.query(
                """
                select b.booking_id, b.booking_code, bd.checkin_date, bd.checkout_date, b.booking_status, b.payment_status
                from bookings b
                join booking_details bd on bd.booking_id = b.booking_id
                where b.user_id = ? and b.home_id = ?
                  and upper(coalesce(b.payment_status, '')) = 'PAID'
                  and upper(coalesce(b.booking_status, '')) not in ('CANCELLED','EXPIRED','NO_SHOW','REJECTED')
                  and (upper(coalesce(b.booking_status, '')) = 'COMPLETED' or bd.checkin_date < current_date)
                  and not exists (select 1 from reviews r where r.booking_id = b.booking_id and r.user_id = b.user_id and r.review_status <> 'DELETED')
                order by bd.checkin_date desc, b.booking_id desc
                limit 1
                """,
                (rs, rowNum) -> ReviewEligibilityInfo.builder()
                        .bookingId(rs.getInt("booking_id"))
                        .bookingCode(rs.getString("booking_code"))
                        .checkInDate(rs.getDate("checkin_date").toLocalDate())
                        .checkOutDate(rs.getDate("checkout_date").toLocalDate())
                        .bookingStatus(rs.getString("booking_status"))
                        .paymentStatus(rs.getString("payment_status"))
                        .build(),
                userId,
                homeId
        );
        return rows.isEmpty() ? null : rows.get(0);
    }

    public ReviewEligibilityInfo findEligibleBooking(Integer userId, Integer homeId, Integer bookingId) {
        List<ReviewEligibilityInfo> rows = jdbcTemplate.query(
                """
                select b.booking_id, b.booking_code, bd.checkin_date, bd.checkout_date, b.booking_status, b.payment_status
                from bookings b
                join booking_details bd on bd.booking_id = b.booking_id
                where b.user_id = ? and b.home_id = ? and b.booking_id = ?
                  and upper(coalesce(b.payment_status, '')) = 'PAID'
                  and upper(coalesce(b.booking_status, '')) not in ('CANCELLED','EXPIRED','NO_SHOW','REJECTED')
                  and (upper(coalesce(b.booking_status, '')) = 'COMPLETED' or bd.checkin_date < current_date)
                  and not exists (select 1 from reviews r where r.booking_id = b.booking_id and r.user_id = b.user_id and r.review_status <> 'DELETED')
                limit 1
                """,
                (rs, rowNum) -> ReviewEligibilityInfo.builder()
                        .bookingId(rs.getInt("booking_id"))
                        .bookingCode(rs.getString("booking_code"))
                        .checkInDate(rs.getDate("checkin_date").toLocalDate())
                        .checkOutDate(rs.getDate("checkout_date").toLocalDate())
                        .bookingStatus(rs.getString("booking_status"))
                        .paymentStatus(rs.getString("payment_status"))
                        .build(),
                userId,
                homeId,
                bookingId
        );
        return rows.isEmpty() ? null : rows.get(0);
    }

    public boolean hasAnyCompletedBooking(Integer userId, Integer homeId) {
        Integer count = jdbcTemplate.queryForObject(
                """
                select count(*)
                from bookings b
                join booking_details bd on bd.booking_id = b.booking_id
                where b.user_id = ? and b.home_id = ?
                  and upper(coalesce(b.payment_status, '')) = 'PAID'
                  and upper(coalesce(b.booking_status, '')) not in ('CANCELLED','EXPIRED','NO_SHOW','REJECTED')
                  and (upper(coalesce(b.booking_status, '')) = 'COMPLETED' or bd.checkin_date < current_date)
                """,
                Integer.class,
                userId,
                homeId
        );
        return count != null && count > 0;
    }

    public boolean hasReviewedHomestay(Integer userId, Integer homeId) {
        Integer count = jdbcTemplate.queryForObject(
                "select count(*) from reviews where user_id = ? and home_id = ? and review_status <> 'DELETED'",
                Integer.class,
                userId,
                homeId
        );
        return count != null && count > 0;
    }

    public boolean hasReviewedBooking(Integer userId, Integer bookingId) {
        Integer count = jdbcTemplate.queryForObject(
                "select count(*) from reviews where user_id = ? and booking_id = ? and review_status <> 'DELETED'",
                Integer.class,
                userId,
                bookingId
        );
        return count != null && count > 0;
    }

    public ReviewResponse insertReview(Integer userId, Integer homeId, Integer bookingId, Integer rating, String comment) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        try {
            jdbcTemplate.update(connection -> {
                PreparedStatement ps = connection.prepareStatement(
                        """
                        insert into reviews (booking_id, home_id, user_id, rating, comment, review_status, admin_review_status, moderation_status, moderation_action)
                        values (?, ?, ?, ?, ?, 'VISIBLE', 'NONE', 'PENDING_AI', 'ALLOW')
                        """,
                        Statement.RETURN_GENERATED_KEYS
                );
                ps.setInt(1, bookingId);
                ps.setInt(2, homeId);
                ps.setInt(3, userId);
                ps.setInt(4, rating);
                ps.setString(5, comment);
                return ps;
            }, keyHolder);
        } catch (DuplicateKeyException exception) {
            throw new AppException("Bạn đã đánh giá đơn đặt này rồi");
        }
        refreshHomestayRating(homeId);
        return findById(Objects.requireNonNull(keyHolder.getKey()).intValue());
    }

    public void updateModeration(Integer reviewId, ReviewModerationResult result) {
        ReviewResponse current = findById(reviewId);
        String reviewStatus = "HIDE".equalsIgnoreCase(result.getModerationAction()) ? "HIDDEN" : "VISIBLE";
        jdbcTemplate.update(
                """
                update reviews
                set review_status = ?, admin_review_status = ?, moderation_status = ?, moderation_action = ?, moderation_reason = ?,
                    toxicity_score = ?, profanity_score = ?, insult_score = ?, threat_score = ?, hate_score = ?, death_related_score = ?,
                    spam_score = ?, privacy_score = ?, sentiment = ?, rating_comment_mismatch = ?, moderation_categories = ?,
                    moderated_at = now(), hidden_reason = ?, updated_at = now()
                where review_id = ?
                """,
                reviewStatus,
                safe(result.getAdminReviewStatus(), "NONE"),
                safe(result.getModerationStatus(), "AI_SAFE"),
                safe(result.getModerationAction(), "ALLOW"),
                limitText(result.getModerationReason(), 250),
                result.getToxicityScore(),
                result.getProfanityScore(),
                result.getInsultScore(),
                result.getThreatScore(),
                result.getHateScore(),
                result.getDeathRelatedScore(),
                result.getSpamScore(),
                result.getPrivacyScore(),
                result.getSentiment(),
                Boolean.TRUE.equals(result.getRatingCommentMismatch()),
                safe(result.getCategories(), "[\"SAFE\"]"),
                "HIDDEN".equals(reviewStatus) ? limitText(result.getModerationReason(), 250) : null,
                reviewId
        );
        refreshHomestayRating(current.getHomeId());
    }

    public void insertModerationLog(Integer reviewId, ReviewModerationResult result) {
        jdbcTemplate.update(
                """
                insert into review_moderation_logs
                (review_id, provider, model_name, raw_response, toxicity_score, profanity_score, insult_score, threat_score,
                 hate_score, death_related_score, spam_score, privacy_score, final_score, sentiment, rating_comment_mismatch,
                 moderation_action, admin_review_status, moderation_reason)
                values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                reviewId,
                safe(result.getProvider(), "COZYGO_RULES"),
                result.getModelName(),
                safeRawResponse(result.getRawResponse()),
                result.getToxicityScore(),
                result.getProfanityScore(),
                result.getInsultScore(),
                result.getThreatScore(),
                result.getHateScore(),
                result.getDeathRelatedScore(),
                result.getSpamScore(),
                result.getPrivacyScore(),
                result.getFinalScore(),
                result.getSentiment(),
                Boolean.TRUE.equals(result.getRatingCommentMismatch()),
                safe(result.getModerationAction(), "ALLOW"),
                safe(result.getAdminReviewStatus(), "NONE"),
                limitText(result.getModerationReason(), 250)
        );
    }

    public List<ReviewModerationLogResponse> findModerationLogs(Integer reviewId) {
        return jdbcTemplate.query(
                """
                select log_id, review_id, provider, model_name, raw_response, toxicity_score, profanity_score, insult_score,
                       threat_score, hate_score, death_related_score, spam_score, privacy_score, final_score, sentiment,
                       rating_comment_mismatch, moderation_action, admin_review_status, moderation_reason, created_at
                from review_moderation_logs
                where review_id = ?
                order by created_at desc, log_id desc
                """,
                (rs, rowNum) -> ReviewModerationLogResponse.builder()
                        .logId(rs.getInt("log_id"))
                        .reviewId(rs.getInt("review_id"))
                        .provider(rs.getString("provider"))
                        .modelName(rs.getString("model_name"))
                        .rawResponse(rs.getString("raw_response"))
                        .toxicityScore(rs.getBigDecimal("toxicity_score"))
                        .profanityScore(rs.getBigDecimal("profanity_score"))
                        .insultScore(rs.getBigDecimal("insult_score"))
                        .threatScore(rs.getBigDecimal("threat_score"))
                        .hateScore(rs.getBigDecimal("hate_score"))
                        .deathRelatedScore(rs.getBigDecimal("death_related_score"))
                        .spamScore(rs.getBigDecimal("spam_score"))
                        .privacyScore(rs.getBigDecimal("privacy_score"))
                        .finalScore(rs.getBigDecimal("final_score"))
                        .sentiment(rs.getString("sentiment"))
                        .ratingCommentMismatch(rs.getBoolean("rating_comment_mismatch"))
                        .moderationAction(rs.getString("moderation_action"))
                        .adminReviewStatus(rs.getString("admin_review_status"))
                        .moderationReason(rs.getString("moderation_reason"))
                        .createdAt(toLocalDateTime(rs, "created_at"))
                        .build(),
                reviewId
        );
    }

    public void updateAdminDecision(Integer reviewId, String reviewStatus, String adminReviewStatus, String reason, Integer adminId, String action) {
        ReviewResponse current = findById(reviewId);
        jdbcTemplate.update(
                """
                update reviews
                set review_status = ?, admin_review_status = ?, hidden_reason = ?, moderated_by = ?, moderated_at = now(), updated_at = now(),
                    moderation_action = ?, moderation_status = 'ADMIN_REVIEWED', moderation_reason = ?
                where review_id = ?
                """,
                reviewStatus,
                adminReviewStatus,
                limitText(reason, 250),
                adminId,
                action,
                limitText(reason, 250),
                reviewId
        );
        insertModerationLog(reviewId, ReviewModerationResult.builder()
                .provider("ADMIN")
                .moderationAction(action)
                .adminReviewStatus(adminReviewStatus)
                .moderationReason(limitText(reason, 250))
                .rawResponse("{\"adminId\":" + adminId + ",\"action\":\"" + action + "\"}")
                .build());
        refreshHomestayRating(current.getHomeId());
    }

    public ReviewResponse saveHostReply(Integer reviewId, Integer hostId, String content) {
        Integer existingReplyId = jdbcTemplate.query(
                "select rr.reply_id from review_replies rr where rr.review_id = ? order by coalesce(rr.updated_at, rr.created_at) desc, rr.reply_id desc limit 1",
                rs -> rs.next() ? rs.getInt("reply_id") : null,
                reviewId
        );
        if (existingReplyId != null) {
            throw new AppException("Đánh giá này đã có phản hồi, không thể gửi lại");
        }
        jdbcTemplate.update("insert into review_replies (review_id, user_id, content) values (?, ?, ?)", reviewId, hostId, content);
        return findById(reviewId);
    }

    public void updateStatus(Integer reviewId, String status) {
        ReviewResponse current = findById(reviewId);
        jdbcTemplate.update("update reviews set review_status = ?, admin_review_status = 'RESOLVED', updated_at = now() where review_id = ?", status, reviewId);
        refreshHomestayRating(current.getHomeId());
    }

    public ReviewResponse updateUserReview(Integer reviewId, Integer userId, Integer rating, String comment) {
        ReviewResponse current = findById(reviewId);
        int updated = jdbcTemplate.update(
                """
                update reviews
                set rating = ?, comment = ?, review_status = 'VISIBLE', admin_review_status = 'NONE', moderation_status = 'PENDING_AI',
                    moderation_action = 'ALLOW', moderation_reason = null, toxicity_score = null, profanity_score = null, insult_score = null,
                    threat_score = null, hate_score = null, death_related_score = null, spam_score = null, privacy_score = null,
                    sentiment = null, rating_comment_mismatch = false, moderation_categories = null, hidden_reason = null, updated_at = now()
                where review_id = ? and user_id = ? and review_status <> 'DELETED'
                """,
                rating,
                comment,
                reviewId,
                userId
        );
        if (updated == 0) throw new AppException("Bạn không có quyền sửa đánh giá này");
        refreshHomestayRating(current.getHomeId());
        return findById(reviewId);
    }

    public void softDelete(Integer reviewId) {
        ReviewResponse current = findById(reviewId);
        jdbcTemplate.update("update reviews set review_status = 'DELETED', updated_at = now() where review_id = ?", reviewId);
        refreshHomestayRating(current.getHomeId());
    }

    public boolean isReviewOwnedByHost(Integer reviewId, Integer hostId) {
        Integer count = jdbcTemplate.queryForObject(
                "select count(*) from reviews r join homestays h on h.home_id = r.home_id where r.review_id = ? and h.user_id = ?",
                Integer.class,
                reviewId,
                hostId
        );
        return count != null && count > 0;
    }

    private void refreshHomestayRating(Integer homeId) {
        jdbcTemplate.update(
                """
                update homestays h
                left join (
                    select home_id, round(avg(rating), 2) as rating_avg, count(*) as rating_count
                    from reviews
                    where home_id = ? and review_status = 'VISIBLE'
                    group by home_id
                ) summary on summary.home_id = h.home_id
                set h.rating_avg = coalesce(summary.rating_avg, 0), h.rating_count = coalesce(summary.rating_count, 0), h.updated_at = now()
                where h.home_id = ?
                """,
                homeId,
                homeId
        );
    }

    private List<ReviewResponse> findReviews(String whereClause, String tailClause, Object... args) {
        return jdbcTemplate.query(reviewSelectSql(whereClause, tailClause), this::mapReview, args);
    }

    private String reviewSelectSql(String whereClause, String tailClause) {
        return """
                select r.review_id, r.booking_id, b.booking_code, r.home_id, h.home_name,
                       coalesce(min(case when hi.is_main = true then hi.image_url end), min(hi.image_url)) as homestay_image,
                       r.user_id, u.full_name as customer_name, u.email as customer_email, u.avatar as customer_avatar,
                       h.user_id as host_id, host.full_name as host_name,
                       r.rating, r.comment, r.review_status, r.admin_review_status, r.moderation_status, r.moderation_action,
                       r.moderation_reason, r.toxicity_score, r.profanity_score, r.insult_score, r.threat_score, r.hate_score,
                       r.death_related_score, r.spam_score, r.privacy_score,
                       greatest(coalesce(r.toxicity_score, 0), coalesce(r.profanity_score, 0), coalesce(r.insult_score, 0),
                                coalesce(r.threat_score, 0), coalesce(r.hate_score, 0), coalesce(r.death_related_score, 0),
                                coalesce(r.spam_score, 0), coalesce(r.privacy_score, 0)) as final_score,
                       r.sentiment, r.rating_comment_mismatch, cast(r.moderation_categories as char) as moderation_categories,
                       r.moderated_at, r.moderated_by, r.hidden_reason, r.created_at, r.updated_at,
                       rr.reply_id, rr.content as reply_content, reply_user.full_name as reply_author_name,
                       rr.created_at as reply_created_at, rr.updated_at as reply_updated_at
                from reviews r
                join bookings b on b.booking_id = r.booking_id
                join homestays h on h.home_id = r.home_id
                join users u on u.user_id = r.user_id
                join users host on host.user_id = h.user_id
                left join homestay_images hi on hi.home_id = h.home_id
                left join review_replies rr on rr.reply_id = (
                    select rr2.reply_id from review_replies rr2
                    where rr2.review_id = r.review_id
                    order by coalesce(rr2.updated_at, rr2.created_at) desc, rr2.reply_id desc
                    limit 1
                )
                left join users reply_user on reply_user.user_id = rr.user_id
                """ + whereClause + " " + """
                group by r.review_id, r.booking_id, b.booking_code, r.home_id, h.home_name,
                         r.user_id, u.full_name, u.email, u.avatar, h.user_id, host.full_name,
                         r.rating, r.comment, r.review_status, r.admin_review_status, r.moderation_status, r.moderation_action,
                         r.moderation_reason, r.toxicity_score, r.profanity_score, r.insult_score, r.threat_score, r.hate_score,
                         r.death_related_score, r.spam_score, r.privacy_score, r.sentiment, r.rating_comment_mismatch,
                         r.moderation_categories, r.moderated_at, r.moderated_by, r.hidden_reason, r.created_at, r.updated_at,
                         rr.reply_id, rr.content, reply_user.full_name, rr.created_at, rr.updated_at
                """ + tailClause;
    }

    private ReviewResponse mapReview(ResultSet rs, int rowNum) throws java.sql.SQLException {
        Integer homeId = rs.getInt("home_id");
        String reviewStatus = rs.getString("review_status");
        String adminStatus = rs.getString("admin_review_status");
        return ReviewResponse.builder()
                .reviewId(rs.getInt("review_id"))
                .bookingId(rs.getInt("booking_id"))
                .bookingCode(defaultBookingCode(rs.getString("booking_code"), rs.getInt("booking_id")))
                .homeId(homeId)
                .homestayCode("HMS-" + String.format("%03d", homeId))
                .homestayName(rs.getString("home_name"))
                .homestayImage(rs.getString("homestay_image"))
                .userId(rs.getInt("user_id"))
                .customerName(rs.getString("customer_name"))
                .customerEmail(rs.getString("customer_email"))
                .customerAvatar(rs.getString("customer_avatar"))
                .hostId(rs.getInt("host_id"))
                .hostName(rs.getString("host_name"))
                .rating(rs.getInt("rating"))
                .comment(rs.getString("comment"))
                .status(reviewStatus)
                .reviewStatus(reviewStatus)
                .adminReviewStatus(adminStatus)
                .moderationStatus(rs.getString("moderation_status"))
                .moderationAction(rs.getString("moderation_action"))
                .moderationReason(rs.getString("moderation_reason"))
                .toxicityScore(rs.getBigDecimal("toxicity_score"))
                .profanityScore(rs.getBigDecimal("profanity_score"))
                .insultScore(rs.getBigDecimal("insult_score"))
                .threatScore(rs.getBigDecimal("threat_score"))
                .hateScore(rs.getBigDecimal("hate_score"))
                .deathRelatedScore(rs.getBigDecimal("death_related_score"))
                .spamScore(rs.getBigDecimal("spam_score"))
                .privacyScore(rs.getBigDecimal("privacy_score"))
                .finalScore(rs.getBigDecimal("final_score"))
                .sentiment(rs.getString("sentiment"))
                .ratingCommentMismatch(rs.getObject("rating_comment_mismatch") == null ? null : rs.getBoolean("rating_comment_mismatch"))
                .moderationCategories(rs.getString("moderation_categories"))
                .moderatedAt(toLocalDateTime(rs, "moderated_at"))
                .moderatedBy(rs.getObject("moderated_by") == null ? null : rs.getInt("moderated_by"))
                .hiddenReason(rs.getString("hidden_reason"))
                .displayStatusLabel(displayStatusLabel(reviewStatus, adminStatus))
                .replyId(rs.getObject("reply_id") == null ? null : rs.getInt("reply_id"))
                .replyContent(rs.getString("reply_content"))
                .replyAuthorName(rs.getString("reply_author_name"))
                .replyCreatedAt(toLocalDateTime(rs, "reply_created_at"))
                .replyUpdatedAt(toLocalDateTime(rs, "reply_updated_at"))
                .createdAt(toLocalDateTime(rs, "created_at"))
                .updatedAt(toLocalDateTime(rs, "updated_at"))
                .build();
    }

    private LocalDateTime toLocalDateTime(ResultSet rs, String column) throws java.sql.SQLException {
        Timestamp timestamp = rs.getTimestamp(column);
        return timestamp == null ? null : timestamp.toLocalDateTime();
    }

    private String displayStatusLabel(String reviewStatus, String adminStatus) {
        if ("HIDDEN".equalsIgnoreCase(reviewStatus)) return "Đang được Cozygo xem xét";
        if ("REJECTED".equalsIgnoreCase(reviewStatus)) return "Không hiển thị do vi phạm";
        if ("PENDING".equalsIgnoreCase(adminStatus)) return "Đã đăng, đang chờ Cozygo kiểm tra";
        return "Đang hiển thị";
    }

    private String defaultBookingCode(String bookingCode, Integer bookingId) {
        return bookingCode == null || bookingCode.isBlank() ? "BK" + String.format("%06d", bookingId) : bookingCode;
    }
    private String safeRawResponse(String value) {
        if (value == null || value.isBlank()) return null;
        return limitText(stripUnsafeTextCharacters(value), 4000);
    }

    private String stripUnsafeTextCharacters(String value) {
        StringBuilder builder = new StringBuilder();
        value.codePoints().forEach(codePoint -> {
            if (codePoint == 9 || codePoint == 10 || codePoint == 13 || codePoint >= 32) {
                builder.appendCodePoint(codePoint);
            }
        });
        return builder.toString();
    }

    private String limitText(String value, int maxLength) {
        if (value == null || value.length() <= maxLength) return value;
        return value.substring(0, Math.max(0, maxLength - 3)) + "...";
    }

    private String safe(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

    @Data
    @Builder
    public static class ReviewEligibilityInfo {
        private Integer bookingId;
        private String bookingCode;
        private LocalDate checkInDate;
        private LocalDate checkOutDate;
        private String bookingStatus;
        private String paymentStatus;
    }
}
