package com.homestaybooking.repository;

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
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Repository
@RequiredArgsConstructor
public class ReviewJdbcRepository {

    private final JdbcTemplate jdbcTemplate;

    public List<ReviewResponse> findPublicReviews(Integer homeId) {
        return findReviews("where r.home_id = ? and r.review_status = 'VISIBLE'", "order by r.created_at desc", homeId);
    }

    public List<ReviewResponse> findFeaturedReviews(int limit) {
        return jdbcTemplate.query(reviewSelectSql("where r.review_status = 'VISIBLE'", "order by r.created_at desc limit ?"),
                this::mapReview,
                limit);
    }

    public List<ReviewResponse> findAdminReviews() {
        return findReviews("where r.review_status <> 'DELETED'", "order by r.created_at desc");
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
            throw new AppException("KhĂ´ng tĂ¬m tháº¥y Ä‘Ă¡nh giĂ¡");
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
                  and (
                    upper(coalesce(b.booking_status, '')) = 'COMPLETED'
                    or bd.checkin_date < current_date
                  )
                  and not exists (
                    select 1 from reviews r
                    where r.booking_id = b.booking_id and r.user_id = b.user_id
                  )
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
                  and (
                    upper(coalesce(b.booking_status, '')) = 'COMPLETED'
                    or bd.checkin_date < current_date
                  )
                  and not exists (
                    select 1 from reviews r
                    where r.booking_id = b.booking_id and r.user_id = b.user_id
                  )
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
                  and (
                    upper(coalesce(b.booking_status, '')) = 'COMPLETED'
                    or bd.checkin_date < current_date
                  )
                """,
                Integer.class,
                userId,
                homeId
        );
        return count != null && count > 0;
    }

    public boolean hasReviewedHomestay(Integer userId, Integer homeId) {
        Integer count = jdbcTemplate.queryForObject(
                "select count(*) from reviews where user_id = ? and home_id = ?",
                Integer.class,
                userId,
                homeId
        );
        return count != null && count > 0;
    }

    public boolean hasReviewedBooking(Integer userId, Integer bookingId) {
        Integer count = jdbcTemplate.queryForObject(
                "select count(*) from reviews where user_id = ? and booking_id = ?",
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
                        "insert into reviews (booking_id, home_id, user_id, rating, comment, review_status) values (?, ?, ?, ?, ?, 'VISIBLE')",
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
            throw new AppException("Báº¡n Ä‘Ă£ Ä‘Ă¡nh giĂ¡ Ä‘Æ¡n Ä‘áº·t nĂ y rá»“i");
        }

        refreshHomestayRating(homeId);
        return findById(Objects.requireNonNull(keyHolder.getKey()).intValue());
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

        jdbcTemplate.update(
                "insert into review_replies (review_id, user_id, content) values (?, ?, ?)",
                reviewId,
                hostId,
                content
        );
        return findById(reviewId);
    }

    public void updateStatus(Integer reviewId, String status) {
        ReviewResponse current = findById(reviewId);
        jdbcTemplate.update(
                "update reviews set review_status = ?, updated_at = ? where review_id = ?",
                status,
                Timestamp.valueOf(LocalDateTime.now()),
                reviewId
        );
        refreshHomestayRating(current.getHomeId());
    }

    public ReviewResponse updateUserReview(Integer reviewId, Integer userId, Integer rating, String comment) {
        ReviewResponse current = findById(reviewId);
        int updated = jdbcTemplate.update(
                "update reviews set rating = ?, comment = ?, updated_at = ? where review_id = ? and user_id = ? and review_status <> 'DELETED'",
                rating,
                comment,
                Timestamp.valueOf(LocalDateTime.now()),
                reviewId,
                userId
        );
        if (updated == 0) {
            throw new AppException("Bạn không có quyền sửa đánh giá này");
        }
        refreshHomestayRating(current.getHomeId());
        return findById(reviewId);
    }

    public void softDelete(Integer reviewId) {
        ReviewResponse current = findById(reviewId);
        jdbcTemplate.update(
                "update reviews set review_status = 'DELETED', updated_at = ? where review_id = ?",
                Timestamp.valueOf(LocalDateTime.now()),
                reviewId
        );
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
                set h.rating_avg = coalesce(summary.rating_avg, 0),
                    h.rating_count = coalesce(summary.rating_count, 0),
                    h.updated_at = now()
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
                       r.rating, r.comment, r.review_status, r.created_at, r.updated_at,
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
                """ + whereClause + " "
                + """
                group by r.review_id, r.booking_id, b.booking_code, r.home_id, h.home_name,
                         r.user_id, u.full_name, u.email, u.avatar, h.user_id, host.full_name,
                         r.rating, r.comment, r.review_status, r.created_at, r.updated_at,
                         rr.reply_id, rr.content, reply_user.full_name, rr.created_at, rr.updated_at
                """ + tailClause;
    }

    private ReviewResponse mapReview(java.sql.ResultSet rs, int rowNum) throws java.sql.SQLException {
        Integer homeId = rs.getInt("home_id");
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
                .status(rs.getString("review_status"))
                .replyId(rs.getObject("reply_id") == null ? null : rs.getInt("reply_id"))
                .replyContent(rs.getString("reply_content"))
                .replyAuthorName(rs.getString("reply_author_name"))
                .replyCreatedAt(rs.getTimestamp("reply_created_at") == null ? null : rs.getTimestamp("reply_created_at").toLocalDateTime())
                .replyUpdatedAt(rs.getTimestamp("reply_updated_at") == null ? null : rs.getTimestamp("reply_updated_at").toLocalDateTime())
                .createdAt(rs.getTimestamp("created_at") == null ? null : rs.getTimestamp("created_at").toLocalDateTime())
                .updatedAt(rs.getTimestamp("updated_at") == null ? null : rs.getTimestamp("updated_at").toLocalDateTime())
                .build();
    }

    private String defaultBookingCode(String bookingCode, Integer bookingId) {
        return bookingCode == null || bookingCode.isBlank() ? "BK" + String.format("%06d", bookingId) : bookingCode;
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


