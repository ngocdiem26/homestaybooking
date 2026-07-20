package com.homestaybooking.repository;

import com.homestaybooking.dto.response.HostRevenueBookingResponse;
import com.homestaybooking.dto.response.HostRevenueHomestayResponse;
import com.homestaybooking.dto.response.HostRevenueSummaryResponse;
import com.homestaybooking.dto.response.HostRevenueTrendResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class HostRevenueJdbcRepository {

    private final JdbcTemplate jdbcTemplate;

    public HostRevenueSummaryResponse getRevenue(Integer ownerId, LocalDate fromDate, LocalDate toDate, String groupBy) {
        LocalDateTime from = fromDate.atStartOfDay();
        LocalDateTime to = toDate.plusDays(1).atStartOfDay();
        String format = "month".equalsIgnoreCase(groupBy) ? "%Y-%m" : "%Y-%m-%d";

        HostRevenueSummaryResponse.HostRevenueSummaryResponseBuilder builder = loadSummary(ownerId, fromDate, toDate, groupBy, from, to);
        builder.trends(loadTrends(ownerId, from, to, format));
        builder.homestays(loadHomestayRevenue(ownerId, from, to));
        builder.recentBookings(loadRecentBookings(ownerId, from, to));
        return builder.build();
    }

    private HostRevenueSummaryResponse.HostRevenueSummaryResponseBuilder loadSummary(
            Integer ownerId, LocalDate fromDate, LocalDate toDate, String groupBy, LocalDateTime from, LocalDateTime to
    ) {
        String sql = "select coalesce(sum(b.total_price), 0) as total_revenue, "
                + "coalesce(sum(bd.line_total), 0) as room_revenue, "
                + "coalesce(sum(coalesce(st.service_total, 0)), 0) as service_revenue, "
                + "coalesce(sum(coalesce(b.discount_amount, 0)), 0) as discount_total, "
                + "count(*) as paid_booking_count, "
                + "coalesce(sum(bd.number_of_nights), 0) as occupancy_nights, "
                + "coalesce(avg(b.total_price), 0) as average_order_value "
                + paidRevenueFromSql();

        HostRevenueSummaryResponse.HostRevenueSummaryResponseBuilder builder = jdbcTemplate.queryForObject(
                sql,
                (rs, rowNum) -> HostRevenueSummaryResponse.builder()
                        .fromDate(fromDate)
                        .toDate(toDate)
                        .groupBy(groupBy)
                        .totalRevenue(nonNullMoney(rs.getBigDecimal("total_revenue")))
                        .roomRevenue(nonNullMoney(rs.getBigDecimal("room_revenue")))
                        .serviceRevenue(nonNullMoney(rs.getBigDecimal("service_revenue")))
                        .discountTotal(nonNullMoney(rs.getBigDecimal("discount_total")))
                        .paidBookingCount(rs.getInt("paid_booking_count"))
                        .occupancyNights(rs.getInt("occupancy_nights"))
                        .averageOrderValue(nonNullMoney(rs.getBigDecimal("average_order_value"))),
                ownerId,
                Timestamp.valueOf(from),
                Timestamp.valueOf(to)
        );

        int pendingCount = countBookings(ownerId, from, to,
                "upper(coalesce(b.payment_status, '')) <> 'PAID' and upper(coalesce(b.booking_status, '')) not in ('CANCELLED','EXPIRED','NO_SHOW','REJECTED','DELETED')");
        int completedCount = countBookings(ownerId, from, to,
                "upper(coalesce(b.payment_status, '')) = 'PAID' and upper(coalesce(b.booking_status, '')) not in ('CANCELLED','EXPIRED','NO_SHOW','REJECTED','DELETED') and (upper(coalesce(b.booking_status, '')) = 'COMPLETED' or bd.checkin_date < current_date)");
        int cancelledCount = countBookings(ownerId, from, to,
                "upper(coalesce(b.booking_status, '')) in ('CANCELLED','EXPIRED','NO_SHOW','REJECTED','DELETED')");

        return builder
                .pendingBookingCount(pendingCount)
                .completedBookingCount(completedCount)
                .cancelledBookingCount(cancelledCount);
    }

    private List<HostRevenueTrendResponse> loadTrends(Integer ownerId, LocalDateTime from, LocalDateTime to, String format) {
        String sql = "select date_format(coalesce(pt.paid_at, b.updated_at, b.created_at), ?) as period, "
                + "coalesce(sum(b.total_price), 0) as revenue, count(*) as booking_count "
                + paidRevenueFromSql()
                + " group by date_format(coalesce(pt.paid_at, b.updated_at, b.created_at), ?) order by period";

        return jdbcTemplate.query(
                sql,
                (rs, rowNum) -> HostRevenueTrendResponse.builder()
                        .period(rs.getString("period"))
                        .revenue(nonNullMoney(rs.getBigDecimal("revenue")))
                        .bookingCount(rs.getInt("booking_count"))
                        .build(),
                format,
                ownerId,
                Timestamp.valueOf(from),
                Timestamp.valueOf(to),
                format
        );
    }

    private List<HostRevenueHomestayResponse> loadHomestayRevenue(Integer ownerId, LocalDateTime from, LocalDateTime to) {
        String sql = "select h.home_id, h.home_name, h.province, coalesce(h.rating_avg, 0) as rating_avg, "
                + "count(*) as booking_count, "
                + "sum(case when upper(coalesce(b.booking_status, '')) = 'COMPLETED' or bd.checkin_date < current_date then 1 else 0 end) as completed_count, "
                + "coalesce(sum(b.total_price), 0) as revenue, "
                + "coalesce(sum(bd.line_total), 0) as room_revenue, "
                + "coalesce(sum(coalesce(st.service_total, 0)), 0) as service_revenue "
                + paidRevenueFromSql()
                + " group by h.home_id, h.home_name, h.province, h.rating_avg order by revenue desc, booking_count desc";

        return jdbcTemplate.query(
                sql,
                (rs, rowNum) -> HostRevenueHomestayResponse.builder()
                        .homeId(rs.getInt("home_id"))
                        .homestayName(rs.getString("home_name"))
                        .province(rs.getString("province"))
                        .bookingCount(rs.getInt("booking_count"))
                        .completedCount(rs.getInt("completed_count"))
                        .revenue(nonNullMoney(rs.getBigDecimal("revenue")))
                        .roomRevenue(nonNullMoney(rs.getBigDecimal("room_revenue")))
                        .serviceRevenue(nonNullMoney(rs.getBigDecimal("service_revenue")))
                        .averageRating(nonNullMoney(rs.getBigDecimal("rating_avg")))
                        .build(),
                ownerId,
                Timestamp.valueOf(from),
                Timestamp.valueOf(to)
        );
    }

    private List<HostRevenueBookingResponse> loadRecentBookings(Integer ownerId, LocalDateTime from, LocalDateTime to) {
        String sql = "select b.booking_id, b.booking_code, h.home_name, c.full_name as customer_name, bd.checkin_date, bd.checkout_date, "
                + "b.created_at, coalesce(pt.paid_at, b.updated_at, b.created_at) as paid_at, b.booking_status, b.payment_status, b.payment_method, "
                + "b.total_price, bd.line_total as room_total, coalesce(st.service_total, 0) as service_total, coalesce(b.discount_amount, 0) as discount_amount "
                + paidRevenueFromSql()
                + " order by coalesce(pt.paid_at, b.updated_at, b.created_at) desc, b.booking_id desc limit 12";

        return jdbcTemplate.query(
                sql,
                (rs, rowNum) -> HostRevenueBookingResponse.builder()
                        .bookingId(rs.getInt("booking_id"))
                        .bookingCode(defaultBookingCode(rs.getString("booking_code"), rs.getInt("booking_id")))
                        .homestayName(rs.getString("home_name"))
                        .customerName(rs.getString("customer_name"))
                        .checkInDate(rs.getDate("checkin_date").toLocalDate())
                        .checkOutDate(rs.getDate("checkout_date").toLocalDate())
                        .createdAt(rs.getTimestamp("created_at") == null ? null : rs.getTimestamp("created_at").toLocalDateTime())
                        .paidAt(rs.getTimestamp("paid_at") == null ? null : rs.getTimestamp("paid_at").toLocalDateTime())
                        .bookingStatus(rs.getString("booking_status"))
                        .paymentStatus(rs.getString("payment_status"))
                        .paymentMethod(rs.getString("payment_method"))
                        .totalPrice(nonNullMoney(rs.getBigDecimal("total_price")))
                        .roomTotal(nonNullMoney(rs.getBigDecimal("room_total")))
                        .serviceTotal(nonNullMoney(rs.getBigDecimal("service_total")))
                        .discountAmount(nonNullMoney(rs.getBigDecimal("discount_amount")))
                        .build(),
                ownerId,
                Timestamp.valueOf(from),
                Timestamp.valueOf(to)
        );
    }

    private int countBookings(Integer ownerId, LocalDateTime from, LocalDateTime to, String condition) {
        Integer count = jdbcTemplate.queryForObject(
                "select count(*) from bookings b "
                        + "join homestays h on h.home_id = b.home_id "
                        + "join booking_details bd on bd.booking_id = b.booking_id "
                        + "where h.user_id = ? and b.created_at >= ? and b.created_at < ? and " + condition,
                Integer.class,
                ownerId,
                Timestamp.valueOf(from),
                Timestamp.valueOf(to)
        );
        return count == null ? 0 : count;
    }

    private String paidRevenueFromSql() {
        return " from bookings b "
                + "join homestays h on h.home_id = b.home_id "
                + "join users c on c.user_id = b.user_id "
                + "join booking_details bd on bd.booking_id = b.booking_id "
                + "left join (select booking_id, coalesce(sum(total_price), 0) as service_total from booking_services group by booking_id) st on st.booking_id = b.booking_id "
                + "left join (select booking_id, max(paid_at) as paid_at from payments where upper(coalesce(payment_status, '')) = 'PAID' group by booking_id) pt on pt.booking_id = b.booking_id "
                + "where h.user_id = ? "
                + "and upper(coalesce(b.payment_status, '')) = 'PAID' "
                + "and upper(coalesce(b.booking_status, '')) not in ('CANCELLED','EXPIRED','NO_SHOW','REJECTED','DELETED') "
                + "and coalesce(pt.paid_at, b.updated_at, b.created_at) >= ? "
                + "and coalesce(pt.paid_at, b.updated_at, b.created_at) < ?";
    }

    private BigDecimal nonNullMoney(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private String defaultBookingCode(String bookingCode, Integer bookingId) {
        return bookingCode == null || bookingCode.isBlank() ? "BK" + String.format("%06d", bookingId) : bookingCode;
    }
}
