package com.homestaybooking.repository;

import com.homestaybooking.dto.response.BookingListItemResponse;
import com.homestaybooking.dto.response.BookingPromotionResponse;
import com.homestaybooking.dto.response.BookingServiceLineResponse;
import com.homestaybooking.dto.response.PaymentTransactionResponse;
import com.homestaybooking.exception.AppException;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;
import jakarta.annotation.PostConstruct;

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

    @PostConstruct
    public void ensurePaymentRefundColumns() {
        try {
            addColumnIfMissing("payments", "expires_at", "TIMESTAMP NULL DEFAULT NULL");
            addColumnIfMissing("payments", "refund_amount", "DECIMAL(12,2) NULL");
            addColumnIfMissing("payments", "refund_status", "VARCHAR(50) NULL");
            addColumnIfMissing("payments", "refund_transaction_code", "VARCHAR(80) NULL");
            addColumnIfMissing("payments", "refund_note", "VARCHAR(500) NULL");
            addColumnIfMissing("payments", "refunded_at", "TIMESTAMP NULL DEFAULT NULL");
        } catch (Exception ignored) {
            // Schema can also be updated from database/HomestayBooking.sql in restricted environments.
        }
    }
    private void addColumnIfMissing(String tableName, String columnName, String definition) {
        Integer count = jdbcTemplate.queryForObject(
                "select count(*) from information_schema.columns where table_schema = database() and table_name = ? and column_name = ?",
                Integer.class,
                tableName,
                columnName
        );
        if (count == null || count == 0) {
            jdbcTemplate.execute("alter table " + tableName + " add column " + columnName + " " + definition);
        }
    }

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

    public boolean hasHostUnavailableDate(Integer homeId, LocalDate checkIn, LocalDate checkOut) {
        Integer count = jdbcTemplate.queryForObject(
                "select count(*) from homestay_availabilities "
                        + "where home_id = ? and upper(status) in ('BLOCKED','MAINTENANCE') "
                        + "and available_date >= ? and available_date < ?",
                Integer.class,
                homeId,
                Date.valueOf(checkIn),
                Date.valueOf(checkOut)
        );
        return count != null && count > 0;
    }

    public boolean isUnavailableForBooking(Integer homeId, LocalDate checkIn, LocalDate checkOut) {
        return hasOverlap(homeId, checkIn, checkOut) || hasHostUnavailableDate(homeId, checkIn, checkOut);
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
                            .startDate(toLocalDate(rs.getDate("start_date")))
                            .endDate(toLocalDate(rs.getDate("end_date")))
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
                  and (p.start_date is null or current_date >= p.start_date)
                  and (p.end_date is null or current_date <= p.end_date)
                  and (
                        upper(coalesce(p.promotion_scope, 'GLOBAL')) in ('GLOBAL', 'TIER', 'USER')
                        or (
                            upper(coalesce(p.promotion_scope, 'GLOBAL')) in ('HOMESTAY', 'HOMESTAY_TIER', 'HOMESTAY_USER')
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
                  and (
                        (
                            upper(coalesce(p.promotion_scope, 'GLOBAL')) not in ('USER', 'HOMESTAY_USER', 'TIER', 'HOMESTAY_TIER')
                            and not exists (select 1 from promotion_tiers pt where pt.promotion_id = p.promotion_id)
                            and (p.usage_limit_per_user is null or (
                                select count(*) from promotion_usages pu
                                where pu.promotion_id = p.promotion_id and pu.user_id = ?
                            ) < p.usage_limit_per_user)
                        )
                        or exists (
                            select 1
                            from promotion_users pu
                            where pu.promotion_id = p.promotion_id
                              and pu.user_id = ?
                              and upper(coalesce(pu.user_promotion_status, 'ACTIVE')) = 'ACTIVE'
                              and pu.valid_from <= now()
                              and (pu.valid_until is null or pu.valid_until >= now())
                              and coalesce(pu.used_count, 0) < coalesce(pu.usage_limit, 1)
                        )
                  )
                order by estimated_discount desc, coalesce(p.discount_value, 0) desc,
                         case when p.end_date is null then 1 else 0 end, p.end_date asc
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
                        .endDate(toLocalDate(rs.getDate("end_date")))
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
                    when upper(coalesce(p.status, '')) <> 'ACTIVE' then 0
                    when p.start_date is not null and current_date < p.start_date then 0
                    when p.end_date is not null and current_date > p.end_date then 0
                    when upper(coalesce(p.promotion_scope, 'GLOBAL')) in ('HOMESTAY', 'HOMESTAY_USER', 'HOMESTAY_TIER')
                         and not exists (
                            select 1
                            from promotion_homestays ph
                            where ph.promotion_id = p.promotion_id and ph.home_id = ?
                         ) then 0
                    when (
                            upper(coalesce(p.promotion_scope, 'GLOBAL')) in ('USER', 'HOMESTAY_USER', 'TIER', 'HOMESTAY_TIER')
                            or exists (select 1 from promotion_tiers pt where pt.promotion_id = p.promotion_id)
                         )
                         and not exists (
                            select 1
                            from promotion_users pu
                            where pu.promotion_id = p.promotion_id
                              and pu.user_id = ?
                              and upper(coalesce(pu.user_promotion_status, 'ACTIVE')) = 'ACTIVE'
                              and pu.valid_from <= now()
                              and (pu.valid_until is null or pu.valid_until >= now())
                              and coalesce(pu.used_count, 0) < coalesce(pu.usage_limit, 1)
                         ) then 0
                    else 1
                end
                from promotions p
                where p.promotion_id = ?
                """,
                Integer.class,
                homeId,
                userId,
                promotionId
        );
        return allowed != null && allowed == 1;
    }
    public int countPromotionUsage(Integer promotionId, Integer userId) {
        Integer count = jdbcTemplate.queryForObject(
                "select coalesce((select max(pu.used_count) from promotion_users pu where pu.promotion_id = ? and pu.user_id = ?), "
                        + "(select count(*) from promotion_usages where promotion_id = ? and user_id = ?))",
                Integer.class,
                promotionId,
                userId,
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
        jdbcTemplate.update(
                "update promotion_users set used_count = coalesce(used_count, 0) + 1, "
                        + "user_promotion_status = case when coalesce(used_count, 0) + 1 >= coalesce(usage_limit, 1) then 'USED_UP' else user_promotion_status end "
                        + "where promotion_id = ? and user_id = ? and upper(coalesce(user_promotion_status, 'ACTIVE')) = 'ACTIVE'",
                promotionId,
                userId
        );
    }

    public PaymentStatusInfo findPaymentStatus(Integer bookingId) {
        try {
            return jdbcTemplate.queryForObject(
                    "select b.booking_id, b.home_id, b.booking_code, b.booking_status, b.payment_expires_at, p.payment_status, p.paid_at "
                            + "from bookings b left join payments p on p.booking_id = b.booking_id where b.booking_id = ? order by p.payment_id desc limit 1",
                    (rs, rowNum) -> PaymentStatusInfo.builder()
                            .bookingId(rs.getInt("booking_id"))
                            .homeId(rs.getInt("home_id"))
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

    public int markPaymentPaid(Integer bookingId, Integer paymentId, LocalDateTime paidAt) {
        int changed = jdbcTemplate.update("update payments set payment_status = 'PAID', paid_at = ? where payment_id = ? and payment_status <> 'PAID'", Timestamp.valueOf(paidAt), paymentId);
        jdbcTemplate.update("update bookings set booking_status = 'CONFIRMED', payment_status = 'PAID', updated_at = now() where booking_id = ? and payment_status <> 'PAID'", bookingId);
        return changed;
    }

    public void markPaymentFailed(Integer bookingId, Integer paymentId) {
        jdbcTemplate.update(
                "update payments set payment_status = 'FAILED' where payment_id = ? and payment_status = 'PENDING'",
                paymentId
        );
        jdbcTemplate.update(
                "update bookings set payment_status = 'FAILED', updated_at = now() "
                        + "where booking_id = ? and booking_status = 'PAYMENT_PENDING' and payment_status = 'PENDING'",
                bookingId
        );
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

    public BookingListItemResponse findBookingById(Integer bookingId) {
        return findBookings("where b.booking_id = ?", bookingId).stream()
                .findFirst()
                .orElseThrow(() -> new AppException("Không tìm thấy booking"));
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

    public PaymentRefundInfo findLatestPaymentForRefund(Integer bookingId) {
        try {
            return jdbcTemplate.queryForObject(
                    "select b.booking_id, b.booking_code, b.booking_status, b.payment_status as booking_payment_status, "
                            + "p.payment_id, p.amount, p.payment_method, p.payment_status, p.gateway, p.transaction_code, p.paid_at, "
                            + "p.refund_amount, p.refund_status, p.refund_transaction_code, p.refunded_at "
                            + "from bookings b join payments p on p.booking_id = b.booking_id "
                            + "where b.booking_id = ? order by p.payment_id desc limit 1",
                    (rs, rowNum) -> PaymentRefundInfo.builder()
                            .bookingId(rs.getInt("booking_id"))
                            .bookingCode(defaultBookingCode(rs.getString("booking_code"), rs.getInt("booking_id")))
                            .bookingStatus(rs.getString("booking_status"))
                            .bookingPaymentStatus(rs.getString("booking_payment_status"))
                            .paymentId(rs.getInt("payment_id"))
                            .amount(rs.getBigDecimal("amount"))
                            .paymentMethod(rs.getString("payment_method"))
                            .paymentStatus(rs.getString("payment_status"))
                            .gateway(rs.getString("gateway"))
                            .transactionCode(rs.getString("transaction_code"))
                            .paidAt(rs.getTimestamp("paid_at") == null ? null : rs.getTimestamp("paid_at").toLocalDateTime())
                            .refundAmount(rs.getBigDecimal("refund_amount"))
                            .refundStatus(rs.getString("refund_status"))
                            .refundTransactionCode(rs.getString("refund_transaction_code"))
                            .refundedAt(rs.getTimestamp("refunded_at") == null ? null : rs.getTimestamp("refunded_at").toLocalDateTime())
                            .build(),
                    bookingId
            );
        } catch (EmptyResultDataAccessException exception) {
            return null;
        }
    }

    public void markVnpayPaymentRefunded(Integer bookingId, Integer paymentId, BigDecimal amount, String refundTransactionCode, String note) {
        jdbcTemplate.update(
                "update payments set payment_status = 'REFUNDED', refund_status = 'SUCCESS', refund_amount = ?, "
                        + "refund_transaction_code = ?, refund_note = ?, refunded_at = now() "
                        + "where payment_id = ? and booking_id = ?",
                amount,
                refundTransactionCode,
                note,
                paymentId,
                bookingId
        );
        jdbcTemplate.update("update bookings set payment_status = 'REFUNDED', updated_at = now() where booking_id = ?", bookingId);
    }

    public List<PaymentTransactionResponse> findUserPaymentTransactions(Integer userId) {
        String sql = """
                select concat('PAY-', p.payment_id) as transaction_id,
                       b.booking_id,
                       b.booking_code,
                       h.home_name as homestay_name,
                       p.amount,
                       'DEBIT' as direction,
                       'PAYMENT' as transaction_type,
                       p.payment_method,
                       case when upper(coalesce(p.payment_status, '')) = 'REFUNDED' then 'PAID' else p.payment_status end as status,
                       p.gateway,
                       p.transaction_code as reference_code,
                       concat('Thanh toán đơn ', coalesce(b.booking_code, concat('BK', b.booking_id))) as description,
                       coalesce(p.paid_at, p.created_at) as occurred_at,
                       0 as sort_rank
                from payments p
                join bookings b on b.booking_id = p.booking_id
                join homestays h on h.home_id = b.home_id
                where b.user_id = ?
                  and upper(coalesce(p.payment_status, '')) in ('PAID', 'REFUNDED')
                union all
                select concat('REF-', p.payment_id) as transaction_id,
                       b.booking_id,
                       b.booking_code,
                       h.home_name as homestay_name,
                       coalesce(p.refund_amount, p.amount) as amount,
                       'CREDIT' as direction,
                       'REFUND' as transaction_type,
                       p.payment_method,
                       coalesce(p.refund_status, 'SUCCESS') as status,
                       p.gateway,
                       p.refund_transaction_code as reference_code,
                       concat('Hoàn tiền đơn ', coalesce(b.booking_code, concat('BK', b.booking_id))) as description,
                       coalesce(p.refunded_at, p.paid_at, p.created_at) as occurred_at,
                       1 as sort_rank
                from payments p
                join bookings b on b.booking_id = p.booking_id
                join homestays h on h.home_id = b.home_id
                where b.user_id = ?
                  and upper(coalesce(p.payment_status, '')) = 'REFUNDED'
                  and upper(coalesce(p.refund_status, '')) in ('SUCCESS', 'REFUNDED')
                order by occurred_at desc, sort_rank desc, transaction_id desc
                """;

        return jdbcTemplate.query(
                sql,
                (rs, rowNum) -> PaymentTransactionResponse.builder()
                        .transactionId(rs.getString("transaction_id"))
                        .bookingId(rs.getInt("booking_id"))
                        .bookingCode(defaultBookingCode(rs.getString("booking_code"), rs.getInt("booking_id")))
                        .homestayName(rs.getString("homestay_name"))
                        .amount(rs.getBigDecimal("amount"))
                        .direction(rs.getString("direction"))
                        .transactionType(rs.getString("transaction_type"))
                        .paymentMethod(rs.getString("payment_method"))
                        .status(rs.getString("status"))
                        .gateway(rs.getString("gateway"))
                        .referenceCode(rs.getString("reference_code"))
                        .description(rs.getString("description"))
                        .occurredAt(rs.getTimestamp("occurred_at") == null ? null : rs.getTimestamp("occurred_at").toLocalDateTime())
                        .build(),
                userId,
                userId
        );
    }
    private LocalDate toLocalDate(Date date) {
        return date == null ? null : date.toLocalDate();
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
    public static class PaymentRefundInfo {
        private Integer bookingId;
        private String bookingCode;
        private String bookingStatus;
        private String bookingPaymentStatus;
        private Integer paymentId;
        private BigDecimal amount;
        private String paymentMethod;
        private String paymentStatus;
        private String gateway;
        private String transactionCode;
        private LocalDateTime paidAt;
        private BigDecimal refundAmount;
        private String refundStatus;
        private String refundTransactionCode;
        private LocalDateTime refundedAt;
    }
    @Data
    @Builder
    public static class PaymentStatusInfo {
        private Integer bookingId;
        private Integer homeId;
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

