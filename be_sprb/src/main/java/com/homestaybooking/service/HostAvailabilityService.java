package com.homestaybooking.service;

import com.homestaybooking.dto.request.HostAvailabilityUpdateRequest;
import com.homestaybooking.dto.response.HostAvailabilityCalendarResponse;
import com.homestaybooking.dto.response.HostAvailabilityDayResponse;
import com.homestaybooking.entity.User;
import com.homestaybooking.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Date;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class HostAvailabilityService {
    private static final int MAX_CALENDAR_DAYS = 180;

    private final JdbcTemplate jdbcTemplate;
    private final RevenueAccessService revenueAccessService;

    public HostAvailabilityCalendarResponse getCalendar(Integer homeId, LocalDate fromDate, LocalDate toDate, String authorizationHeader) {
        User host = revenueAccessService.requireHost(authorizationHeader);
        LocalDate start = fromDate == null ? LocalDate.now() : fromDate;
        LocalDate end = toDate == null ? start.plusDays(6) : toDate;
        validateRange(start, end);
        String homeName = requireOwnedHomestay(homeId, host.getUserId());

        Map<LocalDate, String> manualStatuses = loadManualStatuses(homeId, start, end);
        Map<LocalDate, BookedDay> bookedDays = loadBookedDays(homeId, start, end);

        HostAvailabilityCalendarResponse response = HostAvailabilityCalendarResponse.builder()
                .homeId(homeId)
                .homeName(homeName)
                .fromDate(start)
                .toDate(end)
                .build();

        for (LocalDate date = start; !date.isAfter(end); date = date.plusDays(1)) {
            BookedDay bookedDay = bookedDays.get(date);
            String status = bookedDay != null ? "BOOKED" : manualStatuses.getOrDefault(date, "AVAILABLE");
            response.getDays().add(HostAvailabilityDayResponse.builder()
                    .date(date)
                    .status(status)
                    .statusLabel(toStatusLabel(status))
                    .booked(bookedDay != null)
                    .bookingCode(bookedDay == null ? null : bookedDay.bookingCode())
                    .customerName(bookedDay == null ? null : bookedDay.customerName())
                    .build());
        }

        return response;
    }

    @Transactional
    public HostAvailabilityCalendarResponse updateRange(HostAvailabilityUpdateRequest request, String authorizationHeader) {
        User host = revenueAccessService.requireHost(authorizationHeader);
        if (request == null || request.getHomeId() == null) {
            throw new AppException("Vui lòng chọn homestay cần cập nhật lịch");
        }

        LocalDate start = request.getStartDate();
        LocalDate end = request.getEndDate();
        if (start == null || end == null) {
            throw new AppException("Vui lòng chọn khoảng ngày cần cập nhật");
        }
        validateRange(start, end);
        requireOwnedHomestay(request.getHomeId(), host.getUserId());

        String status = normalizeStatus(request.getStatus());
        if (!"AVAILABLE".equals(status) && hasBookedDate(request.getHomeId(), start, end)) {
            throw new AppException("Khoảng thời gian đã có khách đặt nên không thể tạm khóa hoặc bảo trì");
        }

        if ("AVAILABLE".equals(status)) {
            jdbcTemplate.update(
                    "delete from homestay_availabilities where home_id = ? and available_date between ? and ?",
                    request.getHomeId(),
                    Date.valueOf(start),
                    Date.valueOf(end)
            );
        } else {
            for (LocalDate date = start; !date.isAfter(end); date = date.plusDays(1)) {
                jdbcTemplate.update(
                        "insert into homestay_availabilities (home_id, available_date, status) values (?, ?, ?) "
                                + "on duplicate key update status = values(status), updated_at = current_timestamp",
                        request.getHomeId(),
                        Date.valueOf(date),
                        status
                );
            }
        }

        return getCalendar(request.getHomeId(), start, end, authorizationHeader);
    }

    private String requireOwnedHomestay(Integer homeId, Integer hostId) {
        if (homeId == null) throw new AppException("Vui lòng chọn homestay");
        List<String> homeNames = jdbcTemplate.queryForList(
                "select home_name from homestays where home_id = ? and user_id = ? and deleted_at is null",
                String.class,
                homeId,
                hostId
        );
        String homeName = homeNames.isEmpty() ? null : homeNames.get(0);
        if (homeName == null) {
            throw new AppException("Bạn không có quyền quản lý lịch của homestay này");
        }
        return homeName;
    }

    private void validateRange(LocalDate start, LocalDate end) {
        if (start == null || end == null || end.isBefore(start)) {
            throw new AppException("Khoảng ngày không hợp lệ");
        }
        long days = ChronoUnit.DAYS.between(start, end) + 1;
        if (days > MAX_CALENDAR_DAYS) {
            throw new AppException("Chỉ được xem hoặc cập nhật tối đa 180 ngày mỗi lần");
        }
    }

    private String normalizeStatus(String status) {
        String normalized = status == null ? "" : status.trim().toUpperCase(Locale.ROOT);
        if (normalized.isBlank()) normalized = "AVAILABLE";
        if (!normalized.equals("AVAILABLE") && !normalized.equals("BLOCKED") && !normalized.equals("MAINTENANCE")) {
            throw new AppException("Trạng thái lịch không hợp lệ");
        }
        return normalized;
    }

    private Map<LocalDate, String> loadManualStatuses(Integer homeId, LocalDate start, LocalDate end) {
        Map<LocalDate, String> result = new HashMap<>();
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(
                "select available_date, status from homestay_availabilities where home_id = ? and available_date between ? and ?",
                homeId,
                Date.valueOf(start),
                Date.valueOf(end)
        );
        for (Map<String, Object> row : rows) {
            Date date = (Date) row.get("available_date");
            if (date != null) {
                result.put(date.toLocalDate(), normalizeStoredStatus((String) row.get("status")));
            }
        }
        return result;
    }

    private Map<LocalDate, BookedDay> loadBookedDays(Integer homeId, LocalDate start, LocalDate end) {
        Map<LocalDate, BookedDay> result = new HashMap<>();
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(
                "select b.booking_code, c.full_name as customer_name, bd.checkin_date, bd.checkout_date "
                        + "from bookings b join booking_details bd on bd.booking_id = b.booking_id "
                        + "join users c on c.user_id = b.user_id "
                        + "where b.home_id = ? and b.booking_status in ('CONFIRMED','PAYMENT_PENDING') "
                        + "and (b.booking_status = 'CONFIRMED' or b.payment_expires_at is null or b.payment_expires_at > now()) "
                        + "and bd.checkin_date <= ? and bd.checkout_date > ?",
                homeId,
                Date.valueOf(end),
                Date.valueOf(start)
        );

        for (Map<String, Object> row : rows) {
            Date checkInDate = (Date) row.get("checkin_date");
            Date checkOutDate = (Date) row.get("checkout_date");
            if (checkInDate == null || checkOutDate == null) continue;

            LocalDate checkIn = checkInDate.toLocalDate();
            LocalDate checkOut = checkOutDate.toLocalDate();
            BookedDay bookedDay = new BookedDay((String) row.get("booking_code"), (String) row.get("customer_name"));
            LocalDate cursor = checkIn.isBefore(start) ? start : checkIn;
            LocalDate lastBookedNight = checkOut.minusDays(1);
            LocalDate rangeEnd = lastBookedNight.isAfter(end) ? end : lastBookedNight;
            while (!cursor.isAfter(rangeEnd)) {
                result.put(cursor, bookedDay);
                cursor = cursor.plusDays(1);
            }
        }

        return result;
    }

    private boolean hasBookedDate(Integer homeId, LocalDate start, LocalDate end) {
        Integer count = jdbcTemplate.queryForObject(
                "select count(*) from bookings b join booking_details bd on bd.booking_id = b.booking_id "
                        + "where b.home_id = ? and b.booking_status in ('CONFIRMED','PAYMENT_PENDING') "
                        + "and (b.booking_status = 'CONFIRMED' or b.payment_expires_at is null or b.payment_expires_at > now()) "
                        + "and bd.checkin_date <= ? and bd.checkout_date > ?",
                Integer.class,
                homeId,
                Date.valueOf(end),
                Date.valueOf(start)
        );
        return count != null && count > 0;
    }

    private String normalizeStoredStatus(String status) {
        String normalized = status == null ? "" : status.trim().toUpperCase(Locale.ROOT);
        if (normalized.equals("BLOCKED") || normalized.equals("MAINTENANCE")) return normalized;
        return "AVAILABLE";
    }

    private record BookedDay(String bookingCode, String customerName) {}

    private String toStatusLabel(String status) {
        return switch (status) {
            case "BOOKED" -> "Đã đặt";
            case "BLOCKED" -> "Tạm khóa";
            case "MAINTENANCE" -> "Bảo trì";
            default -> "Còn trống";
        };
    }
}
