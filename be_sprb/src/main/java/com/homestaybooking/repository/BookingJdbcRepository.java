package com.homestaybooking.repository;

import com.homestaybooking.dto.response.BookingListItemResponse;
import com.homestaybooking.dto.response.BookingPromotionResponse;
import com.homestaybooking.dto.response.BookingServiceLineResponse;
import com.homestaybooking.exception.AppException;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Repository
@RequiredArgsConstructor
public class BookingJdbcRepository {

    private final JdbcTemplate jdbcTemplate;

    public HomestayBookingInfo findHomestay(Integer homeId) {
        try {
            return jdbcTemplate.queryForObject(
                    "select h.home_id, h.user_id as owner_id, h.home_name, h.home_address, h.province, h.price_per_night, "
                            + "h.status, h.deleted_at, h.max_guest, h.checkin_time, h.checkout_time, h.discount_percent, "
                            + "coalesce(min(case when hi.is_main = true then hi.image_url end), min(hi.image_url)) as image_url "
                            + "from homestays h left join homestay_images hi on hi.home_id = h.home_id "
                            + "where h.home_id = ? group by h.home_id, h.user_id, h.home_name, h.home_address, h.province, h.price_per_night, "
                            + "h.status, h.deleted_at, h.max_guest, h.checkin_time, h.checkout_time, h.discount_percent",
                    (rs, rowNum) -> HomestayBookingInfo.builder()
                            .homeId(rs.getInt("home_id"))
                            .ownerId(rs.getInt("owner_id"))
                            .homeName(rs.getString("home_name"))
                            .homeAddress(rs.getString("home_address"))
                            .province(rs.getString("province"))
                            .pricePerNight(rs.getBigDecimal("price_per_night"))
                            .status(rs.getString("status"))
                            .deletedAt(rs.getTimestamp("deleted_at") == null ? null : rs.getTimestamp("deleted_at").toLocalDateTime())
                            .maxGuest(rs.getInt("max_guest"))
                            .imageUrl(rs.getString("image_url"))
                            .discountPercent(rs.getBigDecimal("discount_percent"))
                            .build(),
                    homeId
            );
        } catch (EmptyResultDataAccessException exception) {
            throw new AppException("KhĂ´ng tĂ¬m tháº¥y homestay");
        }
    }

    public boolean hasOverlap(Integer homeId, LocalDate checkIn, LocalDate checkOut) {
        Integer count = jdbcTemplate.queryForObject(
                "select count(*) from bookings b join booking_details bd on bd.booking_id = b.booking_id "
                        + "where b.home_id = ? and b.booking_status in ('CONFIRMED','PAYMENT_PENDING') "
                        + "and (b.booking_status = 'CONFIRMED' or b.payment_expires_at is null or b.payment_expires_at > now()) "
                        + "and bd.checkin_date < ? and bd.checkout_date > ?",
                Integer.class,
                homeId,
                Date.valueOf(checkOut),
                Date.valueOf(checkIn)
        );
        return count != null && count > 0;
    }

    public List<ServiceInfo> findServices(Integer homeId, List<Integer> homestayServiceIds) {
        if (homestayServiceIds == null || homestayServiceIds.isEmpty()) return List.of();
        String placeholders = String.join(",", homestayServiceIds.stream().map(id -> "?").toList());
        Object[] args = new Object[homestayServiceIds.size() + 1];
        args[0] = homeId;
        for (int i = 0; i < homestayServiceIds.size(); i++) args[i + 1] = homestayServiceIds.get(i);

        return jdbcTemplate.query(
                "select hs.homestay_service_id, hs.home_id, s.service_name, hs.price, hs.status "
                        + "from homestay_services hs join services s on s.service_id = hs.service_id "
                        + "where hs.home_id = ? and hs.homestay_service_id in (" + placeholders + ")",
                (rs, rowNum) -> ServiceInfo.builder()
                        .homestayServiceId(rs.getInt("homestay_service_id"))
                        .homeId(rs.getInt("home_id"))
                        .serviceName(rs.getString("service_name"))
                        .price(rs.getBigDecimal("price"))
                        .status(rs.getString("status"))
                        .build(),
                args
        );
    }

    public PromotionInfo findPromotionByCode(String code) {
        if (code == null || code.isBlank()) return null;
        try {
            return jdbcTemplate.queryForObject(
                    "select * from promotions where upper(promotion_code) = upper(?)",
                    (rs, rowNum) -> PromotionInfo.builder()
                            .promotionId(rs.getInt("promotion_id"))
                            .promotionName(rs.getString("promotion_name"))
                            .promotionCode(rs.getString("promotion_code"))
                            .discountType(rs.getString("discount_type"))
                            .discountValue(rs.getBigDecimal("discount_value"))
                            .startDate(rs.getDate("start_date").toLocalDate())
                            .endDate(rs.getDate("end_date").toLocalDate())
                            .maxDiscount(rs.getBigDecimal("max_discount"))
                            .minOrderAmount(rs.getBigDecimal("min_order_amount"))
                            .usageLimitTotal((Integer) rs.getObject("usage_limit_total"))
                            .usageLimitPerUser((Integer) rs.getObject("usage_limit_per_user"))
                            .status(rs.getString("status"))
                            .build(),
                    code.trim()
            );
        } catch (EmptyResultDataAccessException exception) {
            return null;
        }
    }

    public List<BookingPromotionResponse> findAvailablePromotions(BigDecimal orderAmount, Integer userId, Integer homeId) {
        BigDecimal safeOrderAmount = orderAmount == null ? BigDecimal.ZERO : orderAmount;
        String sql = """
                select p.*,
                       case
                           when upper(coalesce(p.discount_type, '')) = 'PERCENT'
                               then least(? * coalesce(p.discount_value, 0) / 100, coalesce(nullif(p.max_discount, 0), ?))
                           else least(coalesce(p.discount_value, 0), ?)
                       end as estimated_discount
                from promotions p
                where upper(coalesce(p.status, '')) = 'ACTIVE'
                  and current_date between p.start_date and p.end_date
                  and (
                        upper(coalesce(p.promotion_scope, 'GLOBAL')) in ('GLOBAL', 'TIER')
                        or (
                            upper(coalesce(p.promotion_scope, 'GLOBAL')) in ('HOMESTAY', 'HOMESTAY_TIER')
                            and exists (
                                select 1
                                from promotion_homestays ph
                                where ph.promotion_id = p.promotion_id and ph.home_id = ?
                            )
                        )
                  )
                  and (p.min_order_amount is null or p.min_order_amount <= ?)
                  and (p.usage_limit_total is null or (
                        select count(*) from promotion_usages pu where pu.promotion_id = p.promotion_id
                  ) < p.usage_limit_total)
                  and (p.usage_limit_per_user is null or (
                        select count(*) from promotion_usages pu
                        where pu.promotion_id = p.promotion_id and pu.user_id = ?
                  ) < p.usage_limit_per_user)
                  and (
                        (
                            upper(coalesce(p.promotion_scope, 'GLOBAL')) not in ('TIER', 'HOMESTAY_TIER')
                            and not exists (select 1 from promotion_tiers pt where pt.promotion_id = p.promotion_id)
                        )
                        or exists (
                            select 1
                            from promotion_tiers pt
                            join customer_tier_accounts cta on cta.current_tier_id = pt.tier_id
                            where pt.promotion_id = p.promotion_id and cta.user_id = ?
                        )
                  )
                order by estimated_discount desc, coalesce(p.discount_value, 0) desc, p.end_date asc
                limit 8
                """;

        return jdbcTemplate.query(
                sql,
                (rs, rowNum) -> BookingPromotionResponse.builder()
                        .promotionId(rs.getInt("promotion_id"))
                        .promotionName(rs.getString("promotion_name"))
                        .promotionCode(rs.getString("promotion_code"))
                        .discountType(rs.getString("discount_type"))
                        .discountValue(rs.getBigDecimal("discount_value"))
                        .maxDiscount(rs.getBigDecimal("max_discount"))
                        .minOrderAmount(rs.getBigDecimal("min_order_amount"))
                        .estimatedDiscount(rs.getBigDecimal("estimated_discount"))
                        .endDate(rs.getDate("end_date").toLocalDate())
                        .build(),
                safeOrderAmount,
                safeOrderAmount,
                safeOrderAmount,
                homeId,
                safeOrderAmount,
                userId,
                userId
        );
    }

    public boolean promotionAllowedForBooking(Integer promotionId, Integer userId, Integer homeId) {
        Integer allowed = jdbcTemplate.queryForObject(
                """
                select case
                    when upper(coalesce(p.promotion_scope, 'GLOBAL')) in ('USER', 'HOMESTAY_USER')
                         and not exists (
                            select 1
                            from promotion_users pu
                            where pu.promotion_id = p.promotion_id and pu.user_id = ?
                         ) then 0
                    when upper(coalesce(p.promotion_scope, 'GLOBAL')) in ('HOMESTAY', 'HOMESTAY_USER', 'HOMESTAY_TIER')
                         and not exists (
                            select 1
                            from promotion_homestays ph
                            where ph.promotion_id = p.promotion_id and ph.home_id = ?
                         ) then 0
                    when exists (
                        select 1
                        from promotion_tiers pt
                        join customer_tier_accounts cta on cta.current_tier_id = pt.tier_id
                        where pt.promotion_id = p.promotion_id and cta.user_id = ?
                    ) then 1
                    when upper(coalesce(p.promotion_scope, 'GLOBAL')) not in ('TIER', 'HOMESTAY_TIER')
                         and not exists (select 1 from promotion_tiers pt where pt.promotion_id = p.promotion_id) then 1
                    else 0
                end
                from promotions p
                where p.promotion_id = ?
                """,
                Integer.class,
                userId,
                homeId,
                userId,
                promotionId
        );
        return allowed != null && allowed == 1;
    }    public int countPromotionUsage(Integer promotionId, Integer userId) {
        Integer count = jdbcTemplate.queryForObject(
                "select count(*) from promotion_usages where promotion_id = ? and user_id = ?",
                Integer.class,
                promotionId,
                userId
        );
        return count == null ? 0 : count;
    }

    public int countPromotionUsageTotal(Integer promotionId) {
        Integer count = jdbcTemplate.queryForObject(
                "select count(*) from promotion_usages where promotion_id = ?",
                Integer.class,
                promotionId
        );
        return count == null ? 0 : count;
    }

    public Integer insertBooking(Integer userId, Integer homeId, String code, String status, String note,
                                 BigDecimal subtotal, BigDecimal discountAmount, BigDecimal totalPrice,
                                 String paymentMethod, String paymentStatus, LocalDateTime expiresAt) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    "insert into bookings (user_id, home_id, booking_status, booking_note, subtotal, discount_amount, total_price, "
                            + "booking_code, payment_method, payment_status, payment_expires_at) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    Statement.RETURN_GENERATED_KEYS
            );
            ps.setInt(1, userId);
            ps.setInt(2, homeId);
            ps.setString(3, status);
            ps.setString(4, note);
            ps.setBigDecimal(5, subtotal);
            ps.setBigDecimal(6, discountAmount);
            ps.setBigDecimal(7, totalPrice);
            ps.setString(8, code);
            ps.setString(9, paymentMethod);
            ps.setString(10, paymentStatus);
            ps.setTimestamp(11, expiresAt == null ? null : Timestamp.valueOf(expiresAt));
            return ps;
        }, keyHolder);
        return Objects.requireNonNull(keyHolder.getKey()).intValue();
    }

    public void insertBookingDetail(Integer bookingId, Integer promotionId, LocalDate checkIn, LocalDate checkOut,
                                    Integer nights, Integer guests, BigDecimal unitPrice, BigDecimal lineTotal) {
        jdbcTemplate.update(
                "insert into booking_details (booking_id, promotion_id, checkin_date, checkout_date, number_of_nights, number_of_guest, unit_price, line_total) "
                        + "values (?, ?, ?, ?, ?, ?, ?, ?)",
                bookingId,
                promotionId,
                Date.valueOf(checkIn),
                Date.valueOf(checkOut),
                nights,
                guests,
                unitPrice,
                lineTotal
        );
    }

    public void insertBookingService(Integer bookingId, Integer homestayServiceId, Integer quantity, BigDecimal unitPrice, BigDecimal totalPrice) {
        jdbcTemplate.update(
                "insert into booking_services (booking_id, homestay_service_id, quantity, unit_price, total_price) values (?, ?, ?, ?, ?)",
                bookingId,
                homestayServiceId,
                quantity,
                unitPrice,
                totalPrice
        );
    }

    public Integer insertPayment(Integer bookingId, BigDecimal amount, String method, String status, String gateway, String transactionCode, LocalDateTime expiresAt) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    "insert into payments (booking_id, amount, payment_method, payment_status, gateway, transaction_code, expires_at) values (?, ?, ?, ?, ?, ?, ?)",
                    Statement.RETURN_GENERATED_KEYS
            );
            ps.setInt(1, bookingId);
            ps.setBigDecimal(2, amount);
            ps.setString(3, method);
            ps.setString(4, status);
            ps.setString(5, gateway);
            ps.setString(6, transactionCode);
            ps.setTimestamp(7, expiresAt == null ? null : Timestamp.valueOf(expiresAt));
            return ps;
        }, keyHolder);
        return Objects.requireNonNull(keyHolder.getKey()).intValue();
    }
    public void updatePaymentTransactionCode(Integer paymentId, String transactionCode) {
        jdbcTemplate.update("update payments set transaction_code = ? where payment_id = ?", transactionCode, paymentId);
    }

    public void insertPromotionUsage(Integer userId, Integer bookingId, Integer promotionId, BigDecimal discountAmount) {
        jdbcTemplate.update(
                "insert into promotion_usages (user_id, booking_id, promotion_id, discount_amount) values (?, ?, ?, ?)",
                userId,
                bookingId,
                promotionId,
                discountAmount
        );
    }

    public PaymentStatusInfo findPaymentStatus(Integer bookingId) {
        try {
            return jdbcTemplate.queryForObject(
                    "select b.booking_id, b.booking_code, b.booking_status, b.payment_expires_at, p.payment_status, p.paid_at "
                            + "from bookings b left join payments p on p.booking_id = b.booking_id where b.booking_id = ? order by p.payment_id desc limit 1",
                    (rs, rowNum) -> PaymentStatusInfo.builder()
                            .bookingId(rs.getInt("booking_id"))
                            .bookingCode(rs.getString("booking_code"))
                            .bookingStatus(rs.getString("booking_status"))
                            .paymentStatus(rs.getString("payment_status"))
                            .paidAt(rs.getTimestamp("paid_at") == null ? null : rs.getTimestamp("paid_at").toLocalDateTime())
                            .expiresAt(rs.getTimestamp("payment_expires_at") == null ? null : rs.getTimestamp("payment_expires_at").toLocalDateTime())
                            .build(),
                    bookingId
            );
        } catch (EmptyResultDataAccessException exception) {
            throw new AppException("KhĂ´ng tĂ¬m tháº¥y booking");
        }
    }

    public PaymentWebhookInfo findPaymentByTransactionCode(String transactionCode) {
        try {
            return jdbcTemplate.queryForObject(
                    "select b.booking_id, b.booking_code, b.booking_status, b.payment_expires_at, p.payment_id, p.amount, p.payment_status "
                            + "from payments p join bookings b on b.booking_id = p.booking_id where p.transaction_code = ?",
                    (rs, rowNum) -> PaymentWebhookInfo.builder()
                            .bookingId(rs.getInt("booking_id"))
                            .bookingCode(rs.getString("booking_code"))
                            .bookingStatus(rs.getString("booking_status"))
                            .expiresAt(rs.getTimestamp("payment_expires_at") == null ? null : rs.getTimestamp("payment_expires_at").toLocalDateTime())
                            .paymentId(rs.getInt("payment_id"))
                            .amount(rs.getBigDecimal("amount"))
                            .paymentStatus(rs.getString("payment_status"))
                            .build(),
                    transactionCode
            );
        } catch (EmptyResultDataAccessException exception) {
            throw new AppException("KhĂ´ng tĂ¬m tháº¥y giao dá»‹ch thanh toĂ¡n");
        }
    }

    public void markPaymentPaid(Integer bookingId, Integer paymentId, LocalDateTime paidAt) {
        jdbcTemplate.update("update payments set payment_status = 'PAID', paid_at = ? where payment_id = ?", Timestamp.valueOf(paidAt), paymentId);
        jdbcTemplate.update("update bookings set booking_status = 'CONFIRMED', payment_status = 'PAID', updated_at = now() where booking_id = ?", bookingId);
    }

    public void markPaymentFailed(Integer bookingId, Integer paymentId) {
        jdbcTemplate.update("update payments set payment_status = 'FAILED' where payment_id = ?", paymentId);
        jdbcTemplate.update("update bookings set payment_status = 'FAILED', updated_at = now() where booking_id = ? and booking_status = 'PAYMENT_PENDING'", bookingId);
    }

    public void expirePaymentBooking(Integer bookingId) {
        jdbcTemplate.update("update payments set payment_status = 'EXPIRED' where booking_id = ? and payment_status = 'PENDING'", bookingId);
        jdbcTemplate.update("update bookings set booking_status = 'EXPIRED', payment_status = 'EXPIRED', updated_at = now() where booking_id = ? and booking_status = 'PAYMENT_PENDING'", bookingId);
    }

    public void expireOverduePaymentBookings() {
        jdbcTemplate.update("update payments p join bookings b on b.booking_id = p.booking_id set p.payment_status = 'EXPIRED' "
                + "where b.booking_status = 'PAYMENT_PENDING' and p.payment_status = 'PENDING' and b.payment_expires_at is not null and b.payment_expires_at < now()");
        jdbcTemplate.update("update bookings set booking_status = 'EXPIRED', payment_status = 'EXPIRED', updated_at = now() "
                + "where booking_status = 'PAYMENT_PENDING' and payment_expires_at is not null and payment_expires_at < now()");
    }

    public List<BookingListItemResponse> findUserBookings(Integer userId) {
        return findBookings("where b.user_id = ?", userId);
    }

    public List<BookingListItemResponse> findHostBookings(Integer ownerId) {
        return findBookings("where h.user_id = ?", ownerId);
    }

    public List<BookingListItemResponse> findAllBookings() {
        return findBookings("");
    }

    private List<BookingListItemResponse> findBookings(String whereClause, Object... args) {
        return jdbcTemplate.query(
                "select b.booking_id, b.booking_code, b.booking_status, b.payment_method, b.payment_status, b.booking_note, "
                        + "b.subtotal, b.discount_amount, b.total_price, b.created_at, b.payment_expires_at, "
                        + "c.user_id as customer_id, c.full_name as customer_name, c.email as customer_email, c.phone_number as customer_phone, "
                        + "owner.user_id as host_id, owner.full_name as host_name, owner.email as host_email, owner.phone_number as host_phone, "
                        + "h.home_id, h.home_name, h.home_address, h.province, "
                        + "coalesce(min(case when hi.is_main = true then hi.image_url end), min(hi.image_url)) as image_url, "
                        + "bd.checkin_date, bd.checkout_date, bd.number_of_nights, bd.number_of_guest, bd.unit_price, bd.line_total, "
                        + "exists(select 1 from reviews r where r.booking_id = b.booking_id and r.user_id = b.user_id) as reviewed "
                        + "from bookings b "
                        + "join users c on c.user_id = b.user_id "
                        + "join homestays h on h.home_id = b.home_id "
                        + "join users owner on owner.user_id = h.user_id "
                        + "join booking_details bd on bd.booking_id = b.booking_id "
                        + "left join homestay_images hi on hi.home_id = h.home_id "
                        + whereClause + " "
                        + "group by b.booking_id, b.user_id, b.home_id, b.booking_code, b.booking_status, b.payment_method, b.payment_status, b.booking_note, "
                        + "b.subtotal, b.discount_amount, b.total_price, b.created_at, b.payment_expires_at, "
                        + "c.user_id, c.full_name, c.email, c.phone_number, owner.user_id, owner.full_name, owner.email, owner.phone_number, "
                        + "h.home_id, h.home_name, h.home_address, h.province, bd.checkin_date, bd.checkout_date, "
                        + "bd.number_of_nights, bd.number_of_guest, bd.unit_price, bd.line_total "
                        + "order by b.created_at desc, b.booking_id desc",
                (rs, rowNum) -> {
                    Integer bookingId = rs.getInt("booking_id");
                    return BookingListItemResponse.builder()
                            .bookingId(bookingId)
                            .bookingCode(defaultBookingCode(rs.getString("booking_code"), bookingId))
                            .customerId(rs.getInt("customer_id"))
                            .customerName(rs.getString("customer_name"))
                            .customerEmail(rs.getString("customer_email"))
                            .customerPhone(rs.getString("customer_phone"))
                            .hostId(rs.getInt("host_id"))
                            .hostName(rs.getString("host_name"))
                            .hostEmail(rs.getString("host_email"))
                            .hostPhone(rs.getString("host_phone"))
                            .homeId(rs.getInt("home_id"))
                            .homestayName(rs.getString("home_name"))
                            .homestayCode("HMS-" + String.format("%03d", rs.getInt("home_id")))
                            .homestayAddress(rs.getString("home_address"))
                            .province(rs.getString("province"))
                            .imageUrl(rs.getString("image_url"))
                            .bookingStatus(rs.getString("booking_status"))
                            .paymentMethod(rs.getString("payment_method"))
                            .paymentStatus(rs.getString("payment_status"))
                            .checkInDate(rs.getDate("checkin_date").toLocalDate())
                            .checkOutDate(rs.getDate("checkout_date").toLocalDate())
                            .numberOfNights(rs.getInt("number_of_nights"))
                            .numberOfGuest(rs.getInt("number_of_guest"))
                            .unitPrice(rs.getBigDecimal("unit_price"))
                            .roomTotal(rs.getBigDecimal("line_total"))
                            .serviceTotal(getServiceTotal(bookingId))
                            .discountAmount(rs.getBigDecimal("discount_amount"))
                            .totalPrice(rs.getBigDecimal("total_price"))
                            .note(rs.getString("booking_note"))
                            .createdAt(rs.getTimestamp("created_at") == null ? null : rs.getTimestamp("created_at").toLocalDateTime())
                            .expiresAt(rs.getTimestamp("payment_expires_at") == null ? null : rs.getTimestamp("payment_expires_at").toLocalDateTime())
                            .reviewed(rs.getBoolean("reviewed"))
                            .services(findBookingServices(bookingId))
                            .build();
                },
                args
        );
    }

    public List<BookingServiceLineResponse> findBookingServices(Integer bookingId) {
        return jdbcTemplate.query(
                "select bs.homestay_service_id, s.service_name, bs.quantity, bs.unit_price, bs.total_price "
                        + "from booking_services bs "
                        + "join homestay_services hs on hs.homestay_service_id = bs.homestay_service_id "
                        + "join services s on s.service_id = hs.service_id "
                        + "where bs.booking_id = ? order by bs.booking_service_id",
                (rs, rowNum) -> BookingServiceLineResponse.builder()
                        .homestayServiceId(rs.getInt("homestay_service_id"))
                        .serviceName(rs.getString("service_name"))
                        .quantity(rs.getInt("quantity"))
                        .unitPrice(rs.getBigDecimal("unit_price"))
                        .totalPrice(rs.getBigDecimal("total_price"))
                        .build(),
                bookingId
        );
    }

    private BigDecimal getServiceTotal(Integer bookingId) {
        BigDecimal total = jdbcTemplate.queryForObject(
                "select coalesce(sum(total_price), 0) from booking_services where booking_id = ?",
                BigDecimal.class,
                bookingId
        );
        return total == null ? BigDecimal.ZERO : total;
    }

    public boolean isBookingOwnedByUser(Integer bookingId, Integer userId) {
        Integer count = jdbcTemplate.queryForObject(
                "select count(*) from bookings where booking_id = ? and user_id = ?",
                Integer.class,
                bookingId,
                userId
        );
        return count != null && count > 0;
    }

    public boolean isBookingOwnedByHost(Integer bookingId, Integer ownerId) {
        Integer count = jdbcTemplate.queryForObject(
                "select count(*) from bookings b join homestays h on h.home_id = b.home_id where b.booking_id = ? and h.user_id = ?",
                Integer.class,
                bookingId,
                ownerId
        );
        return count != null && count > 0;
    }

    public String findBookingStatus(Integer bookingId) {
        try {
            return jdbcTemplate.queryForObject("select booking_status from bookings where booking_id = ?", String.class, bookingId);
        } catch (EmptyResultDataAccessException exception) {
            throw new AppException("KhĂ´ng tĂ¬m tháº¥y booking");
        }
    }

    public void updateBookingStatus(Integer bookingId, String bookingStatus) {
        jdbcTemplate.update("update bookings set booking_status = ?, updated_at = now() where booking_id = ?", bookingStatus, bookingId);
    }

    public void confirmPayAtPropertyPayment(Integer bookingId) {
        jdbcTemplate.update(
                "update payments set payment_status = 'PAID', paid_at = now() where booking_id = ? and payment_method = 'PAY_AT_PROPERTY' and payment_status = 'PENDING'",
                bookingId
        );
        jdbcTemplate.update("update bookings set booking_status = 'CONFIRMED', payment_status = 'PAID', updated_at = now() where booking_id = ?", bookingId);
    }

    private String defaultBookingCode(String bookingCode, Integer bookingId) {
        return bookingCode == null || bookingCode.isBlank() ? "BK" + String.format("%06d", bookingId) : bookingCode;
    }

    @Data
    @Builder
    public static class HomestayBookingInfo {
        private Integer homeId;
        private Integer ownerId;
        private String homeName;
        private String homeAddress;
        private String province;
        private BigDecimal pricePerNight;
        private String status;
        private LocalDateTime deletedAt;
        private Integer maxGuest;
        private String imageUrl;
        private BigDecimal discountPercent;
    }

    @Data
    @Builder
    public static class ServiceInfo {
        private Integer homestayServiceId;
        private Integer homeId;
        private String serviceName;
        private BigDecimal price;
        private String status;
    }

    @Data
    @Builder
    public static class PromotionInfo {
        private Integer promotionId;
        private String promotionName;
        private String promotionCode;
        private String discountType;
        private BigDecimal discountValue;
        private LocalDate startDate;
        private LocalDate endDate;
        private BigDecimal maxDiscount;
        private BigDecimal minOrderAmount;
        private Integer usageLimitTotal;
        private Integer usageLimitPerUser;
        private String status;
    }

    @Data
    @Builder
    public static class PaymentStatusInfo {
        private Integer bookingId;
        private String bookingCode;
        private String bookingStatus;
        private String paymentStatus;
        private LocalDateTime paidAt;
        private LocalDateTime expiresAt;
    }

    @Data
    @Builder
    public static class PaymentWebhookInfo {
        private Integer bookingId;
        private String bookingCode;
        private String bookingStatus;
        private LocalDateTime expiresAt;
        private Integer paymentId;
        private BigDecimal amount;
        private String paymentStatus;
    }
}

