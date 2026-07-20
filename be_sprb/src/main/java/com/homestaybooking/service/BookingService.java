package com.homestaybooking.service;

import com.homestaybooking.dto.request.BookingCreateRequest;
import com.homestaybooking.dto.request.BookingQuoteRequest;
import com.homestaybooking.dto.request.BookingServiceSelectionRequest;
import com.homestaybooking.dto.request.SepayWebhookRequest;
import com.homestaybooking.dto.response.BookingListItemResponse;
import com.homestaybooking.dto.response.BookingPaymentStatusResponse;
import com.homestaybooking.dto.response.BookingPriceQuoteResponse;
import com.homestaybooking.dto.response.BookingResponse;
import com.homestaybooking.dto.response.BookingServiceLineResponse;
import com.homestaybooking.entity.User;
import com.homestaybooking.exception.AppException;
import com.homestaybooking.repository.BookingJdbcRepository;
import com.homestaybooking.repository.UserRepository;
import com.homestaybooking.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BookingService {

    private static final String PAYMENT_METHOD_SEPAY = "SEPAY";
    private static final String PAYMENT_METHOD_PAY_AT_PROPERTY = "PAY_AT_PROPERTY";

    private final BookingJdbcRepository bookingRepository;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    @Transactional(readOnly = true)
    public BookingPriceQuoteResponse quote(BookingQuoteRequest request, String authorizationHeader) {
        User user = resolveUser(authorizationHeader);
        return buildQuote(request, user, true);
    }

    @Transactional(readOnly = true)
    public List<BookingListItemResponse> getMyBookings(String authorizationHeader) {
        User user = resolveUser(authorizationHeader);
        return bookingRepository.findUserBookings(user.getUserId());
    }

    @Transactional(readOnly = true)
    public List<BookingListItemResponse> getHostBookings(String authorizationHeader) {
        User host = resolveUser(authorizationHeader);
        return bookingRepository.findHostBookings(host.getUserId());
    }

    @Transactional(readOnly = true)
    public List<BookingListItemResponse> getAdminBookings(String authorizationHeader) {
        requireAdmin(authorizationHeader);
        return bookingRepository.findAllBookings();
    }

    @Transactional
    public BookingListItemResponse cancelMyBooking(Integer bookingId, String authorizationHeader) {
        User user = resolveUser(authorizationHeader);
        if (!bookingRepository.isBookingOwnedByUser(bookingId, user.getUserId())) {
            throw new AppException("Bạn không có quyền hủy booking này");
        }
        String status = nullToEmpty(bookingRepository.findBookingStatus(bookingId));
        if (Set.of("CANCELLED", "EXPIRED", "COMPLETED", "NO_SHOW").contains(status.toUpperCase(Locale.ROOT))) {
            throw new AppException("Booking này không thể hủy ở trạng thái hiện tại");
        }
        bookingRepository.updateBookingStatus(bookingId, "CANCELLED");
        return bookingRepository.findUserBookings(user.getUserId()).stream()
                .filter(item -> item.getBookingId().equals(bookingId))
                .findFirst()
                .orElseThrow(() -> new AppException("Không tìm thấy booking sau khi hủy"));
    }

    @Transactional
    public BookingListItemResponse updateHostBookingStatus(Integer bookingId, String nextStatus, String authorizationHeader) {
        User host = resolveUser(authorizationHeader);
        if (!bookingRepository.isBookingOwnedByHost(bookingId, host.getUserId())) {
            throw new AppException("Bạn không có quyền cập nhật booking này");
        }
        String normalizedStatus = normalizeHostStatus(nextStatus);
        bookingRepository.updateBookingStatus(bookingId, normalizedStatus);
        return bookingRepository.findHostBookings(host.getUserId()).stream()
                .filter(item -> item.getBookingId().equals(bookingId))
                .findFirst()
                .orElseThrow(() -> new AppException("Không tìm thấy booking sau khi cập nhật"));
    }

    @Transactional
    public BookingListItemResponse updateAdminBookingStatus(Integer bookingId, String nextStatus, String authorizationHeader) {
        requireAdmin(authorizationHeader);
        String normalizedStatus = normalizeHostStatus(nextStatus);
        bookingRepository.updateBookingStatus(bookingId, normalizedStatus);
        return bookingRepository.findAllBookings().stream()
                .filter(item -> item.getBookingId().equals(bookingId))
                .findFirst()
                .orElseThrow(() -> new AppException("Không tìm thấy booking sau khi cập nhật"));
    }

    @Transactional
    public BookingListItemResponse confirmAdminBookingPayment(Integer bookingId, String authorizationHeader) {
        requireAdmin(authorizationHeader);
        BookingListItemResponse currentBooking = bookingRepository.findAllBookings().stream()
                .filter(item -> item.getBookingId().equals(bookingId))
                .findFirst()
                .orElseThrow(() -> new AppException("Không tìm thấy booking"));
        validateManualPaymentConfirmation(currentBooking);
        bookingRepository.confirmPayAtPropertyPayment(bookingId);
        return bookingRepository.findAllBookings().stream()
                .filter(item -> item.getBookingId().equals(bookingId))
                .findFirst()
                .orElseThrow(() -> new AppException("Không tìm thấy booking sau khi xác nhận thanh toán"));
    }

    @Transactional
    public BookingListItemResponse confirmHostBookingPayment(Integer bookingId, String authorizationHeader) {
        User host = resolveUser(authorizationHeader);
        if (!bookingRepository.isBookingOwnedByHost(bookingId, host.getUserId())) {
            throw new AppException("Bạn không có quyền xác nhận thanh toán booking này");
        }

        BookingListItemResponse currentBooking = bookingRepository.findHostBookings(host.getUserId()).stream()
                .filter(item -> item.getBookingId().equals(bookingId))
                .findFirst()
                .orElseThrow(() -> new AppException("Không tìm thấy booking"));

        String bookingStatus = nullToEmpty(currentBooking.getBookingStatus()).toUpperCase(Locale.ROOT);
        if (Set.of("CANCELLED", "EXPIRED", "NO_SHOW").contains(bookingStatus)) {
            throw new AppException("Không thể xác nhận thanh toán cho đơn đã hủy hoặc quá hạn");
        }
        if (!Set.of("CONFIRMED", "COMPLETED").contains(bookingStatus)) {
            throw new AppException("Chỉ xác nhận thanh toán sau khi đơn đã được duyệt");
        }
        if (!PAYMENT_METHOD_PAY_AT_PROPERTY.equals(nullToEmpty(currentBooking.getPaymentMethod()).toUpperCase(Locale.ROOT))) {
            throw new AppException("Chỉ xác nhận thủ công cho đơn thanh toán tại chỗ");
        }
        if ("PAID".equals(nullToEmpty(currentBooking.getPaymentStatus()).toUpperCase(Locale.ROOT))) {
            return currentBooking;
        }

        bookingRepository.confirmPayAtPropertyPayment(bookingId);
        return bookingRepository.findHostBookings(host.getUserId()).stream()
                .filter(item -> item.getBookingId().equals(bookingId))
                .findFirst()
                .orElseThrow(() -> new AppException("Không tìm thấy booking sau khi xác nhận thanh toán"));
    }

    @Transactional
    public BookingResponse createBooking(BookingCreateRequest request, String authorizationHeader) {
        User user = resolveUser(authorizationHeader);
        validateGuestInfo(request);
        bookingRepository.expireOverduePaymentBookings();

        BookingPriceQuoteResponse quote = buildQuote(request, user, true);
        String paymentMethod = normalizePaymentMethod(request.getPaymentMethod());
        boolean isSepay = PAYMENT_METHOD_SEPAY.equals(paymentMethod);
        String bookingStatus = "PAYMENT_PENDING";
        String paymentStatus = "PENDING";
        LocalDateTime expiresAt = isSepay ? LocalDateTime.now().plusMinutes(15) : null;
        String bookingCode = generateBookingCode();
        String transactionCode = isSepay ? "SEPAY" + bookingCode : null;

        Integer bookingId = bookingRepository.insertBooking(
                user.getUserId(),
                request.getHomeId(),
                bookingCode,
                bookingStatus,
                trimToNull(request.getNote()),
                quote.getRoomTotal().add(quote.getServiceTotal()),
                quote.getDiscountAmount(),
                quote.getFinalAmount(),
                paymentMethod,
                paymentStatus,
                expiresAt
        );

        Integer promotionId = findAppliedPromotionId(request.getPromotionCode());
        bookingRepository.insertBookingDetail(
                bookingId,
                promotionId,
                quote.getCheckInDate(),
                quote.getCheckOutDate(),
                quote.getNumberOfNights(),
                quote.getNumberOfGuest(),
                quote.getUnitPrice(),
                quote.getRoomTotal()
        );

        for (BookingServiceLineResponse serviceLine : quote.getServices()) {
            bookingRepository.insertBookingService(
                    bookingId,
                    serviceLine.getHomestayServiceId(),
                    serviceLine.getQuantity(),
                    serviceLine.getUnitPrice(),
                    serviceLine.getTotalPrice()
            );
        }

        if (promotionId != null && quote.getDiscountAmount().compareTo(BigDecimal.ZERO) > 0) {
            bookingRepository.insertPromotionUsage(user.getUserId(), bookingId, promotionId, quote.getDiscountAmount());
        }

        bookingRepository.insertPayment(
                bookingId,
                quote.getFinalAmount(),
                paymentMethod,
                paymentStatus,
                isSepay ? "SEPAY" : null,
                transactionCode,
                expiresAt
        );

        return BookingResponse.builder()
                .bookingId(bookingId)
                .bookingCode(bookingCode)
                .bookingStatus(bookingStatus)
                .paymentMethod(paymentMethod)
                .paymentStatus(paymentStatus)
                .amount(quote.getFinalAmount())
                .transactionCode(transactionCode)
                .qrCodeUrl(isSepay ? buildSepayQrUrl(bookingCode, transactionCode, quote.getFinalAmount()) : null)
                .expiresAt(expiresAt)
                .quote(quote)
                .build();
    }

    @Transactional
    public BookingPaymentStatusResponse getPaymentStatus(Integer bookingId) {
        BookingJdbcRepository.PaymentStatusInfo status = bookingRepository.findPaymentStatus(bookingId);
        if ("PAYMENT_PENDING".equals(status.getBookingStatus())
                && status.getExpiresAt() != null
                && status.getExpiresAt().isBefore(LocalDateTime.now())
                && !"PAID".equals(status.getPaymentStatus())) {
            bookingRepository.expirePaymentBooking(bookingId);
            status = bookingRepository.findPaymentStatus(bookingId);
        }

        return BookingPaymentStatusResponse.builder()
                .bookingId(status.getBookingId())
                .bookingCode(status.getBookingCode())
                .bookingStatus(status.getBookingStatus())
                .paymentStatus(status.getPaymentStatus())
                .paidAt(status.getPaidAt())
                .expiresAt(status.getExpiresAt())
                .build();
    }

    @Transactional
    public BookingPaymentStatusResponse handleSepayWebhook(SepayWebhookRequest request) {
        if (request.getTransactionCode() == null || request.getTransactionCode().isBlank()) {
            throw new AppException("Thiếu mã giao dịch SePay");
        }
        if (request.getAmount() == null) {
            throw new AppException("Thiếu số tiền thanh toán");
        }

        BookingJdbcRepository.PaymentWebhookInfo payment = bookingRepository.findPaymentByTransactionCode(request.getTransactionCode().trim());
        if (!"PENDING".equals(payment.getPaymentStatus()) || !"PAYMENT_PENDING".equals(payment.getBookingStatus())) {
            throw new AppException("Giao dịch không còn ở trạng thái chờ thanh toán");
        }
        if (payment.getExpiresAt() != null && payment.getExpiresAt().isBefore(LocalDateTime.now())) {
            bookingRepository.expirePaymentBooking(payment.getBookingId());
            throw new AppException("Giao dịch đã quá hạn thanh toán");
        }
        if (payment.getAmount().compareTo(request.getAmount()) != 0) {
            throw new AppException("Số tiền webhook không khớp với booking");
        }

        bookingRepository.markPaymentPaid(
                payment.getBookingId(),
                payment.getPaymentId(),
                request.getPaidAt() == null ? LocalDateTime.now() : request.getPaidAt()
        );
        return getPaymentStatus(payment.getBookingId());
    }

    private BookingPriceQuoteResponse buildQuote(BookingQuoteRequest request, User user, boolean validateOverlap) {
        if (request.getHomeId() == null) throw new AppException("Thiếu homestay cần đặt");
        if (request.getCheckInDate() == null) throw new AppException("Vui lòng chọn ngày nhận phòng");
        if (request.getCheckOutDate() == null) throw new AppException("Vui lòng chọn ngày trả phòng");
        if (request.getCheckInDate().isBefore(LocalDate.now())) throw new AppException("Ngày nhận phòng không được nhỏ hơn hôm nay");
        if (!request.getCheckOutDate().isAfter(request.getCheckInDate())) throw new AppException("Ngày trả phòng phải sau ngày nhận phòng");

        BookingJdbcRepository.HomestayBookingInfo homestay = bookingRepository.findHomestay(request.getHomeId());
        if (homestay.getDeletedAt() != null) throw new AppException("Homestay đã bị xóa");
        if (!"APPROVED".equalsIgnoreCase(nullToEmpty(homestay.getStatus()))) throw new AppException("Homestay chưa được duyệt để đặt phòng");
        if (Objects.equals(homestay.getOwnerId(), user.getUserId())) throw new AppException("Chủ homestay không thể tự đặt homestay của mình");

        int guests = Math.max(1, request.getNumberOfGuest() == null ? 1 : request.getNumberOfGuest());
        if (guests > homestay.getMaxGuest()) throw new AppException("Số khách vượt quá sức chứa homestay");
        if (validateOverlap && bookingRepository.hasOverlap(request.getHomeId(), request.getCheckInDate(), request.getCheckOutDate())) {
            throw new AppException("Khoảng ngày này đã có booking khác. Vui lòng chọn ngày khác");
        }

        int nights = Math.toIntExact(Duration.between(request.getCheckInDate().atStartOfDay(), request.getCheckOutDate().atStartOfDay()).toDays());
        BigDecimal unitPrice = defaultMoney(homestay.getPricePerNight());
        BigDecimal roomTotal = unitPrice.multiply(BigDecimal.valueOf(nights));
        List<BookingServiceLineResponse> serviceLines = buildServiceLines(homestay.getHomeId(), request.getServices());
        BigDecimal serviceTotal = serviceLines.stream()
                .map(BookingServiceLineResponse::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal beforeDiscount = roomTotal.add(serviceTotal);
        AppliedPromotion appliedPromotion = applyPromotion(request.getPromotionCode(), beforeDiscount, user.getUserId());
        BigDecimal finalAmount = beforeDiscount.subtract(appliedPromotion.discountAmount()).max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);

        return BookingPriceQuoteResponse.builder()
                .homeId(homestay.getHomeId())
                .homestayName(homestay.getHomeName())
                .homestayAddress(homestay.getHomeAddress())
                .imageUrl(homestay.getImageUrl())
                .checkInDate(request.getCheckInDate())
                .checkOutDate(request.getCheckOutDate())
                .numberOfNights(nights)
                .numberOfGuest(guests)
                .unitPrice(unitPrice)
                .roomTotal(roomTotal)
                .serviceTotal(serviceTotal)
                .discountAmount(appliedPromotion.discountAmount())
                .finalAmount(finalAmount)
                .appliedPromotionCode(appliedPromotion.code())
                .services(serviceLines)
                .availablePromotions(bookingRepository.findAvailablePromotions(beforeDiscount))
                .build();
    }

    private List<BookingServiceLineResponse> buildServiceLines(Integer homeId, List<BookingServiceSelectionRequest> selections) {
        if (selections == null || selections.isEmpty()) return List.of();
        Map<Integer, Integer> quantities = new HashMap<>();
        for (BookingServiceSelectionRequest selection : selections) {
            if (selection == null || selection.getHomestayServiceId() == null) continue;
            int quantity = Math.max(1, selection.getQuantity() == null ? 1 : selection.getQuantity());
            quantities.merge(selection.getHomestayServiceId(), quantity, Integer::sum);
        }
        if (quantities.isEmpty()) return List.of();

        List<BookingJdbcRepository.ServiceInfo> services = bookingRepository.findServices(homeId, quantities.keySet().stream().toList());
        if (services.size() != quantities.size()) throw new AppException("Có dịch vụ không thuộc homestay này");

        return services.stream().map(service -> {
            if (!"APPROVED".equalsIgnoreCase(nullToEmpty(service.getStatus()))) {
                throw new AppException("Dịch vụ " + service.getServiceName() + " chưa được phép đặt");
            }
            int quantity = quantities.get(service.getHomestayServiceId());
            BigDecimal unitPrice = defaultMoney(service.getPrice());
            return BookingServiceLineResponse.builder()
                    .homestayServiceId(service.getHomestayServiceId())
                    .serviceName(service.getServiceName())
                    .quantity(quantity)
                    .unitPrice(unitPrice)
                    .totalPrice(unitPrice.multiply(BigDecimal.valueOf(quantity)))
                    .build();
        }).toList();
    }

    private AppliedPromotion applyPromotion(String code, BigDecimal beforeDiscount, Integer userId) {
        if (code == null || code.isBlank()) return new AppliedPromotion(null, null, BigDecimal.ZERO);
        BookingJdbcRepository.PromotionInfo promotion = bookingRepository.findPromotionByCode(code.trim());
        if (promotion == null) throw new AppException("Mã khuyến mãi không hợp lệ");
        if (!"ACTIVE".equalsIgnoreCase(nullToEmpty(promotion.getStatus()))) throw new AppException("Mã khuyến mãi không còn hoạt động");
        LocalDate today = LocalDate.now();
        if (today.isBefore(promotion.getStartDate()) || today.isAfter(promotion.getEndDate())) throw new AppException("Mã khuyến mãi đã hết hạn hoặc chưa bắt đầu");
        if (promotion.getMinOrderAmount() != null && beforeDiscount.compareTo(promotion.getMinOrderAmount()) < 0) throw new AppException("Đơn đặt chưa đủ điều kiện dùng mã");
        if (promotion.getUsageLimitTotal() != null && bookingRepository.countPromotionUsageTotal(promotion.getPromotionId()) >= promotion.getUsageLimitTotal()) throw new AppException("Mã khuyến mãi đã hết lượt sử dụng");
        if (promotion.getUsageLimitPerUser() != null && bookingRepository.countPromotionUsage(promotion.getPromotionId(), userId) >= promotion.getUsageLimitPerUser()) throw new AppException("Bạn đã sử dụng hết lượt cho mã này");

        BigDecimal discount;
        if ("PERCENT".equalsIgnoreCase(promotion.getDiscountType())) {
            discount = beforeDiscount.multiply(defaultMoney(promotion.getDiscountValue())).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        } else {
            discount = defaultMoney(promotion.getDiscountValue());
        }
        if (promotion.getMaxDiscount() != null && promotion.getMaxDiscount().compareTo(BigDecimal.ZERO) > 0) {
            discount = discount.min(promotion.getMaxDiscount());
        }
        discount = discount.min(beforeDiscount).max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
        return new AppliedPromotion(promotion.getPromotionId(), promotion.getPromotionCode(), discount);
    }

    private Integer findAppliedPromotionId(String code) {
        BookingJdbcRepository.PromotionInfo promotion = bookingRepository.findPromotionByCode(code);
        return promotion == null ? null : promotion.getPromotionId();
    }

    private void validateGuestInfo(BookingCreateRequest request) {
        if (isBlank(request.getCustomerName())) throw new AppException("Vui lòng nhập họ tên khách đặt");
        if (isBlank(request.getCustomerEmail())) throw new AppException("Vui lòng nhập email khách đặt");
        if (isBlank(request.getCustomerPhone())) throw new AppException("Vui lòng nhập số điện thoại khách đặt");
    }

    private User resolveUser(String authorizationHeader) {
        String email = jwtUtil.extractEmailFromAuthorizationHeader(authorizationHeader);
        if (email == null) throw new AppException("Vui lòng đăng nhập để đặt homestay");
        return userRepository.findByEmail(email).orElseThrow(() -> new AppException("Không tìm thấy tài khoản đang đăng nhập"));
    }

    private User requireAdmin(String authorizationHeader) {
        User user = resolveUser(authorizationHeader);
        String roleName = user.getRole() == null ? "" : nullToEmpty(user.getRole().getRoleName()).toUpperCase(Locale.ROOT);
        if (!"ADMIN".equals(roleName)) {
            throw new AppException("Bạn không có quyền quản lý đơn đặt phòng của hệ thống");
        }
        return user;
    }

    private void validateManualPaymentConfirmation(BookingListItemResponse currentBooking) {
        String bookingStatus = nullToEmpty(currentBooking.getBookingStatus()).toUpperCase(Locale.ROOT);
        if (Set.of("CANCELLED", "EXPIRED", "NO_SHOW").contains(bookingStatus)) {
            throw new AppException("Không thể xác nhận thanh toán cho đơn đã hủy hoặc quá hạn");
        }
        if (!Set.of("CONFIRMED", "COMPLETED").contains(bookingStatus)) {
            throw new AppException("Chỉ xác nhận thanh toán sau khi đơn đã được duyệt");
        }
        if (!PAYMENT_METHOD_PAY_AT_PROPERTY.equals(nullToEmpty(currentBooking.getPaymentMethod()).toUpperCase(Locale.ROOT))) {
            throw new AppException("Chỉ xác nhận thủ công cho đơn thanh toán tại chỗ");
        }
    }

    private String normalizeHostStatus(String status) {
        String normalized = status == null ? "" : status.trim().toUpperCase(Locale.ROOT);
        if (Set.of("CONFIRMED", "CANCELLED", "COMPLETED", "NO_SHOW").contains(normalized)) {
            return normalized;
        }
        throw new AppException("Trạng thái booking không hợp lệ");
    }

    private String normalizePaymentMethod(String method) {
        String normalized = method == null ? "" : method.trim().toUpperCase(Locale.ROOT);
        if (PAYMENT_METHOD_SEPAY.equals(normalized) || PAYMENT_METHOD_PAY_AT_PROPERTY.equals(normalized)) return normalized;
        throw new AppException("Phương thức thanh toán không hợp lệ");
    }

    private String generateBookingCode() {
        return "BK" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")) + UUID.randomUUID().toString().substring(0, 4).toUpperCase(Locale.ROOT);
    }

    private String buildSepayQrUrl(String bookingCode, String transactionCode, BigDecimal amount) {
        String payload = "SEPAY " + transactionCode + " " + bookingCode + " " + amount.setScale(0, RoundingMode.HALF_UP).toPlainString();
        return "https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=" + URLEncoder.encode(payload, StandardCharsets.UTF_8);
    }

    private BigDecimal defaultMoney(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private String nullToEmpty(String value) {
        return value == null ? "" : value;
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) return null;
        return value.trim();
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private record AppliedPromotion(Integer promotionId, String code, BigDecimal discountAmount) {}
}
