package com.homestaybooking.repository;

import com.homestaybooking.dto.response.ComplaintResponse;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class ComplaintJdbcRepository {
    private static final String CONTENT_SEPARATOR = "\n---NOI_DUNG_KHIEU_NAI---\n";

    private final JdbcTemplate jdbcTemplate;

    public BookingComplaintReference findBookingReference(Integer bookingId) {
        return jdbcTemplate.queryForObject(
                "select b.booking_id, b.user_id, b.home_id, b.total_price, h.home_name, h.province, h.user_id as host_id "
                        + "from bookings b join homestays h on h.home_id = b.home_id where b.booking_id = ?",
                (rs, rowNum) -> BookingComplaintReference.builder()
                        .bookingId(rs.getInt("booking_id"))
                        .customerId(rs.getInt("user_id"))
                        .homeId(rs.getInt("home_id"))
                        .hostId(rs.getInt("host_id"))
                        .homestayName(rs.getString("home_name"))
                        .province(rs.getString("province"))
                        .build(),
                bookingId
        );
    }

    public Integer insertComplaint(Integer customerId, Integer bookingId, String title, String description) {
        String content = composeContent(title, description);
        jdbcTemplate.update(
                "insert into complaints (user_id, booking_id, complaint_content, complaint_status) values (?, ?, ?, 'PENDING')",
                customerId, bookingId, content
        );
        return jdbcTemplate.queryForObject("select last_insert_id()", Integer.class);
    }

    public List<ComplaintResponse> findCustomerComplaints(Integer customerId) {
        return findMany("where c.user_id = ? order by c.created_at desc, c.complaint_id desc", customerId);
    }

    public List<ComplaintResponse> findHostComplaints(Integer hostId) {
        return findMany("where h.user_id = ? order by c.created_at desc, c.complaint_id desc", hostId);
    }

    public List<ComplaintResponse> findAdminComplaints() {
        return findMany("order by c.created_at desc, c.complaint_id desc");
    }

    public ComplaintResponse findCustomerComplaint(Integer complaintId, Integer customerId) {
        return findOne("where c.complaint_id = ? and c.user_id = ?", complaintId, customerId);
    }

    public ComplaintResponse findHostComplaint(Integer complaintId, Integer hostId) {
        return findOne("where c.complaint_id = ? and h.user_id = ?", complaintId, hostId);
    }

    public ComplaintResponse findAdminComplaint(Integer complaintId) {
        return findOne("where c.complaint_id = ?", complaintId);
    }

    public boolean isCustomerComplaint(Integer complaintId, Integer customerId) {
        Integer count = jdbcTemplate.queryForObject(
                "select count(*) from complaints where complaint_id = ? and user_id = ?",
                Integer.class, complaintId, customerId
        );
        return count != null && count > 0;
    }

    public boolean isHostComplaint(Integer complaintId, Integer hostId) {
        Integer count = jdbcTemplate.queryForObject(
                "select count(*) from complaints c join bookings b on b.booking_id = c.booking_id join homestays h on h.home_id = b.home_id where c.complaint_id = ? and h.user_id = ?",
                Integer.class, complaintId, hostId
        );
        return count != null && count > 0;
    }

    public void updateAdminResolution(Integer complaintId, String status, String reply) {
        jdbcTemplate.update(
                "update complaints set complaint_status = ?, complaint_reply = ? where complaint_id = ?",
                status, reply, complaintId
        );
    }

    public void updateStatus(Integer complaintId, String status) {
        jdbcTemplate.update("update complaints set complaint_status = ? where complaint_id = ?", status, complaintId);
    }

    private ComplaintResponse findOne(String whereClause, Object... args) {
        List<ComplaintResponse> results = findMany(whereClause, args);
        if (results.isEmpty()) {
            throw new EmptyResultDataAccessException(1);
        }
        return results.get(0);
    }

    private List<ComplaintResponse> findMany(String suffix, Object... args) {
        String sql = "select c.complaint_id, c.user_id, c.booking_id, c.complaint_content, c.complaint_status, c.created_at, c.complaint_reply, "
                + "b.home_id, b.total_price, h.home_name, h.province, h.user_id as host_id, "
                + "customer.full_name as customer_name, customer.email as customer_email, host.full_name as host_name, "
                + "bd.checkin_date, bd.checkout_date "
                + "from complaints c "
                + "join bookings b on b.booking_id = c.booking_id "
                + "join users customer on customer.user_id = c.user_id "
                + "join homestays h on h.home_id = b.home_id "
                + "join users host on host.user_id = h.user_id "
                + "left join booking_details bd on bd.booking_id = b.booking_id "
                + suffix;
        return jdbcTemplate.query(sql, this::mapComplaint, args);
    }

    private ComplaintResponse mapComplaint(ResultSet rs, int rowNum) throws SQLException {
        ParsedContent parsed = parseContent(rs.getString("complaint_content"));
        Integer complaintId = rs.getInt("complaint_id");
        String status = normalizeStatus(rs.getString("complaint_status"));
        return ComplaintResponse.builder()
                .complaintId(complaintId)
                .complaintCode("KN" + String.format("%06d", complaintId))
                .bookingId(rs.getInt("booking_id"))
                .bookingCode("BK" + String.format("%06d", rs.getInt("booking_id")))
                .homeId(rs.getInt("home_id"))
                .homestayName(rs.getString("home_name"))
                .province(rs.getString("province"))
                .customerId(rs.getInt("user_id"))
                .customerName(rs.getString("customer_name"))
                .customerEmail(rs.getString("customer_email"))
                .hostId(rs.getInt("host_id"))
                .hostName(rs.getString("host_name"))
                .title(parsed.title())
                .description(parsed.description())
                .status(status)
                .statusLabel(statusLabel(status))
                .reply(rs.getString("complaint_reply"))
                .mailSent(hasText(rs.getString("complaint_reply")) && ("RESOLVED".equals(status) || "REJECTED".equals(status)))
                .totalAmount(rs.getBigDecimal("total_price"))
                .checkInDate(rs.getDate("checkin_date") == null ? null : rs.getDate("checkin_date").toLocalDate())
                .checkOutDate(rs.getDate("checkout_date") == null ? null : rs.getDate("checkout_date").toLocalDate())
                .createdAt(toLocalDateTime(rs.getTimestamp("created_at")))
                .build();
    }

    public static String composeContent(String title, String description) {
        String normalizedTitle = hasText(title) ? title.trim() : "Khiếu nại đặt phòng";
        String normalizedDescription = hasText(description) ? description.trim() : "Khách hàng chưa nhập nội dung chi tiết.";
        return "Tiêu đề: " + normalizedTitle + CONTENT_SEPARATOR + normalizedDescription;
    }

    private ParsedContent parseContent(String content) {
        if (!hasText(content)) return new ParsedContent("Khiếu nại đặt phòng", "");
        String value = content.trim();
        if (value.startsWith("Tiêu đề: ") && value.contains(CONTENT_SEPARATOR)) {
            String[] parts = value.split(CONTENT_SEPARATOR, 2);
            return new ParsedContent(parts[0].replaceFirst("Tiêu đề:\s*", "").trim(), parts.length > 1 ? parts[1].trim() : "");
        }
        return new ParsedContent("Khiếu nại đặt phòng", value);
    }

    private String normalizeStatus(String status) {
        if (!hasText(status)) return "PENDING";
        String normalized = status.trim().toUpperCase();
        if ("OPEN".equals(normalized)) return "PENDING";
        if ("ADMIN_REVIEWING".equals(normalized) || "HOST_REVIEWING".equals(normalized) || "PROCESS".equals(normalized)) return "PROCESSING";
        if ("CLOSED".equals(normalized)) return "RESOLVED";
        return normalized;
    }

    private String statusLabel(String status) {
        return switch (status) {
            case "PROCESSING" -> "Đang xử lý";
            case "RESOLVED" -> "Đã xử lý";
            case "REJECTED" -> "Từ chối";
            default -> "Chưa xử lý";
        };
    }

    private LocalDateTime toLocalDateTime(Timestamp timestamp) {
        return timestamp == null ? null : timestamp.toLocalDateTime();
    }

    private static boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    private record ParsedContent(String title, String description) {
    }

    @Data
    @Builder
    public static class BookingComplaintReference {
        private Integer bookingId;
        private Integer customerId;
        private Integer homeId;
        private Integer hostId;
        private String homestayName;
        private String province;
    }
}
