package com.homestaybooking.service;

import com.homestaybooking.dto.request.BookingCreateRequest;
import com.homestaybooking.dto.request.BookingQuoteRequest;
import com.homestaybooking.dto.request.BookingServiceSelectionRequest;
import com.homestaybooking.dto.response.BookingListItemResponse;
import com.homestaybooking.dto.response.BookingPaymentStatusResponse;
import com.homestaybooking.dto.response.BookingPriceQuoteResponse;
import com.homestaybooking.dto.response.BookingResponse;
import com.homestaybooking.dto.response.PaymentTransactionResponse;
import com.homestaybooking.dto.response.BookingServiceLineResponse;
import com.homestaybooking.entity.User;
import com.homestaybooking.exception.AppException;
import com.homestaybooking.repository.BookingJdbcRepository;
import com.homestaybooking.repository.UserRepository;
import com.homestaybooking.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Isolation;
import com.homestaybooking.service.VnpayService;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.time.ZoneId;
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

    private static final ZoneId VIETNAM_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");


    private static final String PAYMENT_METHOD_VNPAY = "VNPAY";
    private static final String PAYMENT_METHOD_PAY_AT_PROPERTY = "PAY_AT_PROPERTY";

    private final BookingJdbcRepository bookingRepository;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final VnpayService vnpayService;
    private final BookingCommissionService bookingCommissionService;
    private final BookingConfirmationMailService bookingConfirmationMailService;
    private final CustomerTierService customerTierService;
    private final com.homestaybooking.repository.RevenueJdbcRepository revenueRepository;

    @Transactional
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
    public List<PaymentTransactionResponse> getMyPaymentTransactions(String authorizationHeader) {
        User user = resolveUser(authorizationHeader);
        return bookingRepository.findUserPaymentTransactions(user.getUserId());
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
        BookingListItemResponse currentBooking = bookingRepository.findBookingById(bookingId);
        String status = nullToEmpty(currentBooking.getBookingStatus());
        if (Set.of("CANCELLED", "EXPIRED", "COMPLETED", "NO_SHOW").contains(status.toUpperCase(Locale.ROOT))) {
            throw new AppException("Booking này không thể hủy ở trạng thái hiện tại");
        }
        validateCancellationDeadline(currentBooking);
        bookingRepository.updateBookingStatus(bookingId, "CANCELLED");
        refundPaidVnpayPaymentIfNeeded(bookingId);
        bookingCommissionService.cancelCommissionWithFullRefund(bookingId, "FREE_CANCELLATION");
        return bookingRepository.findUserBookings(user.getUserId()).stream()
                .filter(item -> item.getBookingId().equals(bookingId))
                .findFirst()
                .orElseThrow(() -> new AppException("Không tìm thấy booking sau khi hủy"));
    }

    @Transactional
    public BookingListItemResponse updateHostBookingStatus(Integer bookingId, String nextStatus, String authorizationHeader) {
        User host = resolveUser(authorizationHeader);
        if (!bookingRepository.isBookingOwnedByHost(bookingId, host.getUserId())) {
            throw new AppException("Báº¡n khĂ´ng cĂ³ quyá»n cáº­p nháº­t booking nĂ y");
        }
        String beforeStatus = nullToEmpty(bookingRepository.findBookingStatus(bookingId)).toUpperCase(Locale.ROOT);
        String normalizedStatus = normalizeHostStatus(nextStatus);
        bookingRepository.updateBookingStatus(bookingId, normalizedStatus);
        if ("CANCELLED".equals(normalizedStatus)) {
            refundPaidVnpayPaymentIfNeeded(bookingId);
            bookingCommissionService.cancelCommissionWithFullRefund(bookingId, "HOST_CANCELLATION");
        } else if ("COMPLETED".equals(normalizedStatus) || "NO_SHOW".equals(normalizedStatus)) {
            bookingCommissionService.recognizeCommission(bookingId);
        }
        BookingListItemResponse updatedBooking = bookingRepository.findHostBookings(host.getUserId()).stream()
                .filter(item -> item.getBookingId().equals(bookingId))
                .findFirst()
                .orElseThrow(() -> new AppException("KhĂ´ng tĂ¬m tháº¥y booking sau khi cáº­p nháº­t"));
        sendConfirmationMailIfNewlyConfirmed(updatedBooking, beforeStatus, normalizedStatus, "HOST_CONFIRMED");
        return updatedBooking;
    }

    @Transactional
    public BookingListItemResponse updateAdminBookingStatus(Integer bookingId, String nextStatus, String authorizationHeader) {
        requireAdmin(authorizationHeader);
        String beforeStatus = nullToEmpty(bookingRepository.findBookingStatus(bookingId)).toUpperCase(Locale.ROOT);
        String normalizedStatus = normalizeHostStatus(nextStatus);
        bookingRepository.updateBookingStatus(bookingId, normalizedStatus);
        if ("CANCELLED".equals(normalizedStatus)) {
            refundPaidVnpayPaymentIfNeeded(bookingId);
            bookingCommissionService.cancelCommissionWithFullRefund(bookingId, "FREE_CANCELLATION");
        } else if ("COMPLETED".equals(normalizedStatus) || "NO_SHOW".equals(normalizedStatus)) {
            bookingCommissionService.recognizeCommission(bookingId);
        }
        BookingListItemResponse updatedBooking = bookingRepository.findAllBookings().stream()
                .filter(item -> item.getBookingId().equals(bookingId))
                .findFirst()
                .orElseThrow(() -> new AppException("KhĂ´ng tĂ¬m tháº¥y booking sau khi cáº­p nháº­t"));
        sendConfirmationMailIfNewlyConfirmed(updatedBooking, beforeStatus, normalizedStatus, "HOST_CONFIRMED");
        return updatedBooking;
    }

    @Transactional
    public BookingListItemResponse confirmAdminBookingPayment(Integer bookingId, String authorizationHeader) {
        requireAdmin(authorizationHeader);
        BookingListItemResponse currentBooking = bookingRepository.findAllBookings().stream()
                .filter(item -> item.getBookingId().equals(bookingId))
                .findFirst()
                .orElseThrow(() -> new AppException("Không tìm thấy booking"));
        validateManualPaymentConfirmation(currentBooking);
        if ("PAID".equals(nullToEmpty(currentBooking.getPaymentStatus()).toUpperCase(Locale.ROOT))) {
            return currentBooking;
        }
        bookingRepository.confirmPayAtPropertyPayment(bookingId);
        bookingCommissionService.createOrUpdatePendingCommission(bookingId);
        BookingListItemResponse updatedBooking = bookingRepository.findAllBookings().stream()
                .filter(item -> item.getBookingId().equals(bookingId))
                .findFirst()
                .orElseThrow(() -> new AppException("Không tìm thấy booking sau khi xác nhận thanh toán"));
        bookingConfirmationMailService.sendConfirmationMail(updatedBooking, "PAYMENT_SUCCESS");
        return updatedBooking;
    }

    @Transactional
    public BookingListItemResponse confirmHostBookingPayment(Integer bookingId, String authorizationHeader) {
        User host = resolveUser(authorizationHeader);
        if (!bookingRepository.isBookingOwnedByHost(bookingId, host.getUserId())) {
            throw new AppException("Báº¡n khĂ´ng cĂ³ quyá»n xĂ¡c nháº­n thanh toĂ¡n booking nĂ y");
        }

        BookingListItemResponse currentBooking = bookingRepository.findHostBookings(host.getUserId()).stream()
                .filter(item -> item.getBookingId().equals(bookingId))
                .findFirst()
                .orElseThrow(() -> new AppException("KhĂ´ng tĂ¬m tháº¥y booking"));

        String bookingStatus = nullToEmpty(currentBooking.getBookingStatus()).toUpperCase(Locale.ROOT);
        if (Set.of("CANCELLED", "EXPIRED", "NO_SHOW").contains(bookingStatus)) {
            throw new AppException("KhĂ´ng thá»ƒ xĂ¡c nháº­n thanh toĂ¡n cho Ä‘Æ¡n Ä‘Ă£ há»§y hoáº·c quĂ¡ háº¡n");
        }
        if (!Set.of("CONFIRMED", "COMPLETED").contains(bookingStatus)) {
            throw new AppException("Chá»‰ xĂ¡c nháº­n thanh toĂ¡n sau khi Ä‘Æ¡n Ä‘Ă£ Ä‘Æ°á»£c duyá»‡t");
        }
        if (!PAYMENT_METHOD_PAY_AT_PROPERTY.equals(nullToEmpty(currentBooking.getPaymentMethod()).toUpperCase(Locale.ROOT))) {
            throw new AppException("Chá»‰ xĂ¡c nháº­n thá»§ cĂ´ng cho Ä‘Æ¡n thanh toĂ¡n táº¡i chá»—");
        }
        if ("PAID".equals(nullToEmpty(currentBooking.getPaymentStatus()).toUpperCase(Locale.ROOT))) {
            return currentBooking;
        }

        bookingRepository.confirmPayAtPropertyPayment(bookingId);
        bookingCommissionService.createOrUpdatePendingCommission(bookingId);
        BookingListItemResponse updatedBooking = bookingRepository.findHostBookings(host.getUserId()).stream()
                .filter(item -> item.getBookingId().equals(bookingId))
                .findFirst()
                .orElseThrow(() -> new AppException("KhĂ´ng tĂ¬m tháº¥y booking sau khi xĂ¡c nháº­n thanh toĂ¡n"));
        bookingConfirmationMailService.sendConfirmationMail(updatedBooking, "PAYMENT_SUCCESS");
        return updatedBooking;
    }

    @Transactional
    public BookingResponse createBooking(BookingCreateRequest request, String authorizationHeader, String clientIp) {
        User user = resolveUser(authorizationHeader);
        validateBookerAge(user);
        validateGuestInfo(request);
        bookingRepository.expireOverduePaymentBookings();

        BookingPriceQuoteResponse quote = buildQuote(request, user, true);
        String paymentMethod = normalizePaymentMethod(request.getPaymentMethod());
        boolean isVnpay = PAYMENT_METHOD_VNPAY.equals(paymentMethod);
        String bookingStatus = "PAYMENT_PENDING";
        String paymentStatus = "PENDING";
        LocalDateTime expiresAt = isVnpay ? nowInVietnam().plusMinutes(15) : null;
        String bookingCode = generateBookingCode();
        String transactionCode = null;

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

        Integer paymentId = bookingRepository.insertPayment(
                bookingId,
                quote.getFinalAmount(),
                paymentMethod,
                paymentStatus,
                isVnpay ? "VNPAY" : null,
                transactionCode,
                expiresAt
        );

        if (isVnpay) {
            transactionCode = String.valueOf(paymentId);
            bookingRepository.updatePaymentTransactionCode(paymentId, transactionCode);
        }

        return BookingResponse.builder()
                .bookingId(bookingId)
                .paymentId(paymentId)
                .bookingCode(bookingCode)
                .bookingStatus(bookingStatus)
                .paymentMethod(paymentMethod)
                .paymentStatus(paymentStatus)
                .amount(quote.getFinalAmount())
                .transactionCode(transactionCode)
                .qrCodeUrl(null)
                .paymentUrl(isVnpay ? buildVnpayPaymentUrl(paymentId, quote.getFinalAmount(), clientIp) : null)
                .expiresAt(expiresAt)
                .quote(quote)
                .build();
    }

    @Transactional
    public BookingPaymentStatusResponse getPaymentStatus(Integer bookingId) {
        BookingJdbcRepository.PaymentStatusInfo status = bookingRepository.findPaymentStatus(bookingId);
        if ("PAYMENT_PENDING".equals(status.getBookingStatus())
                && status.getExpiresAt() != null
                && status.getExpiresAt().isBefore(nowInVietnam())
                && !"PAID".equals(status.getPaymentStatus())) {
            bookingRepository.expirePaymentBooking(bookingId);
            status = bookingRepository.findPaymentStatus(bookingId);
        }

        return BookingPaymentStatusResponse.builder()
                .bookingId(status.getBookingId())
                .homeId(status.getHomeId())
                .bookingCode(status.getBookingCode())
                .bookingStatus(status.getBookingStatus())
                .paymentStatus(status.getPaymentStatus())
                .paidAt(status.getPaidAt())
                .expiresAt(status.getExpiresAt())
                .build();
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public BookingPaymentStatusResponse handleVnpayReturn(Map<String, String> params) {
        return processVnpayCallback(params, true);
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public BookingPaymentStatusResponse handleVnpayIpn(Map<String, String> params) {
        return processVnpayCallback(params, true);
    }

    private BookingPaymentStatusResponse processVnpayCallback(Map<String, String> params, boolean markFailed) {
        if (!vnpayService.verifySignature(params)) {
            throw new AppException("INVALID_SIGNATURE");
        }

        String transactionCode = params.get("vnp_TxnRef");
        if (transactionCode == null || transactionCode.isBlank()) {
            throw new AppException("Thiếu mã giao dịch VNPAY");
        }

        BookingJdbcRepository.PaymentWebhookInfo payment = bookingRepository.findPaymentByTransactionCode(transactionCode.trim());
        BigDecimal paidAmount = parseVnpayAmount(params.get("vnp_Amount"));
        if (payment.getAmount().compareTo(paidAmount) != 0) {
            throw new AppException("Số tiền VNPAY không khớp với booking");
        }

        String currentPaymentStatus = nullToEmpty(payment.getPaymentStatus()).toUpperCase(Locale.ROOT);
        if ("PAID".equals(currentPaymentStatus)) {
            bookingCommissionService.createOrUpdatePendingCommission(payment.getBookingId());
            return getPaymentStatus(payment.getBookingId());
        }

        String responseCode = params.get("vnp_ResponseCode");
        String transactionStatus = params.get("vnp_TransactionStatus");
        boolean vnpaySuccess = "00".equals(responseCode) && "00".equals(transactionStatus);

        // VNPAY đã ký hợp lệ và xác nhận thành công thì ưu tiên kết quả từ cổng.
        // Không từ chối một giao dịch thành công chỉ vì đồng hồ local/DB lệch múi giờ.
        if (vnpaySuccess) {
            int paymentChanged = bookingRepository.markPaymentPaid(
                    payment.getBookingId(),
                    payment.getPaymentId(),
                    parseVnpayPayDate(params.get("vnp_PayDate"))
            );
            bookingCommissionService.createOrUpdatePendingCommission(payment.getBookingId());
            if (paymentChanged > 0) {
                bookingConfirmationMailService.sendConfirmationMail(
                        bookingRepository.findBookingById(payment.getBookingId()),
                        "PAYMENT_SUCCESS"
                );
            }
            return getPaymentStatus(payment.getBookingId());
        }

        if (payment.getExpiresAt() != null && payment.getExpiresAt().isBefore(nowInVietnam())) {
            bookingRepository.expirePaymentBooking(payment.getBookingId());
            throw new AppException("Giao dịch đã quá hạn thanh toán");
        }

        if (markFailed) {
            bookingRepository.markPaymentFailed(payment.getBookingId(), payment.getPaymentId());
        }
        return getPaymentStatus(payment.getBookingId());
    }

    private BookingPriceQuoteResponse buildQuote(BookingQuoteRequest request, User user, boolean validateOverlap) {
        if (request.getHomeId() == null) throw new AppException("Thiếu homestay cần đặt");
        if (request.getCheckInDate() == null) throw new AppException("Vui lòng chọn ngày nhận phòng");
        if (request.getCheckOutDate() == null) throw new AppException("Vui lòng chọn ngày trả phòng");
        if (request.getCheckInDate().isBefore(LocalDate.now(VIETNAM_ZONE))) throw new AppException("Ngày nhận phòng không được nhỏ hơn hôm nay");
        if (!request.getCheckOutDate().isAfter(request.getCheckInDate())) throw new AppException("Ngày trả phòng phải sau ngày nhận phòng");

        BookingJdbcRepository.HomestayBookingInfo homestay = bookingRepository.findHomestay(request.getHomeId());
        if (!revenueRepository.canHostReceiveBooking(request.getHomeId())) throw new AppException("Homestay hiện đang tạm ngưng nhận đặt phòng");
        if (homestay.getDeletedAt() != null) throw new AppException("Homestay đã bị xóa");
        if (!"APPROVED".equalsIgnoreCase(nullToEmpty(homestay.getStatus()))) throw new AppException("Homestay chưa được duyệt để đặt phòng");
        if (Objects.equals(homestay.getOwnerId(), user.getUserId())) throw new AppException("Chủ homestay không thể tự đặt homestay của mình");

        int guests = request.getNumberOfGuest() == null ? 1 : request.getNumberOfGuest();
        if (guests < 1) throw new AppException("Booking phải có ít nhất 1 người lớn");
        if (guests > homestay.getMaxGuest()) throw new AppException("Số lượng khách vượt quá sức chứa tối đa của homestay");
        if (validateOverlap && bookingRepository.isUnavailableForBooking(request.getHomeId(), request.getCheckInDate(), request.getCheckOutDate())) {
            throw new AppException("Khoảng thời gian này đã có booking khác, vui lòng chọn khoảng thời gian khác");
        }

        int nights = Math.toIntExact(Duration.between(request.getCheckInDate().atStartOfDay(), request.getCheckOutDate().atStartOfDay()).toDays());
        BigDecimal unitPrice = defaultMoney(homestay.getPricePerNight());
        BigDecimal roomTotal = unitPrice.multiply(BigDecimal.valueOf(nights));
        List<BookingServiceLineResponse> serviceLines = buildServiceLines(homestay.getHomeId(), request.getServices());
        BigDecimal serviceTotal = serviceLines.stream()
                .map(BookingServiceLineResponse::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal beforeDiscount = roomTotal.add(serviceTotal);
        customerTierService.ensureTierPromotionGrants(user.getUserId());
        AppliedPromotion appliedPromotion = applyPromotion(request.getPromotionCode(), beforeDiscount, user.getUserId(), homestay.getHomeId());
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
                .availablePromotions(bookingRepository.findAvailablePromotions(beforeDiscount, user.getUserId(), homestay.getHomeId()))
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

    private AppliedPromotion applyPromotion(String code, BigDecimal beforeDiscount, Integer userId, Integer homeId) {
        if (code == null || code.isBlank()) return new AppliedPromotion(null, null, BigDecimal.ZERO);
        BookingJdbcRepository.PromotionInfo promotion = bookingRepository.findPromotionByCode(code.trim());
        if (promotion == null) throw new AppException("Mã khuyến mãi không hợp lệ");
        if (!"ACTIVE".equalsIgnoreCase(nullToEmpty(promotion.getStatus()))) throw new AppException("Mã khuyến mãi không còn hoạt động");
        if (!bookingRepository.promotionAllowedForBooking(promotion.getPromotionId(), userId, homeId)) {
            throw new AppException("Mã khuyến mãi này không áp dụng cho hạng thành viên hiện tại của bạn");
        }
        LocalDate today = LocalDate.now(VIETNAM_ZONE);
        if ((promotion.getStartDate() != null && today.isBefore(promotion.getStartDate())) || (promotion.getEndDate() != null && today.isAfter(promotion.getEndDate()))) throw new AppException("Mã khuyến mãi đã hết hạn hoặc chưa bắt đầu");
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

    private void validateBookerAge(User user) {
        if (user.getBirthday() == null) {
            throw new AppException("Vui long cap nhat ngay sinh trong ho so truoc khi dat phong");
        }
        LocalDate today = LocalDate.now(VIETNAM_ZONE);
        if (user.getBirthday().isAfter(today)) {
            throw new AppException("Ngay sinh trong ho so khong hop le");
        }
        if (Period.between(user.getBirthday(), today).getYears() < 18) {
            throw new AppException("Nguoi dung ten dat phong phai tu du 18 tuoi");
        }
    }

    private User resolveUser(String authorizationHeader) {
        String email = jwtUtil.extractEmailFromAuthorizationHeader(authorizationHeader);
        if (email == null) throw new AppException("Vui lòng đăng nhập để đặt homestay");
        return userRepository.findByEmail(email).orElseThrow(() -> new AppException("Người dùng không tồn tại"));
    }

    private User requireAdmin(String authorizationHeader) {
        User user = resolveUser(authorizationHeader);
        String roleName = user.getRole() == null ? "" : nullToEmpty(user.getRole().getRoleName()).toUpperCase(Locale.ROOT);
        if (!"ADMIN".equals(roleName)) {
            throw new AppException("Người dùng không có quyền truy cập");
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

    private void sendConfirmationMailIfNewlyConfirmed(BookingListItemResponse booking, String beforeStatus, String afterStatus, String trigger) {
        if (!"CONFIRMED".equals(afterStatus)) {
            return;
        }
        if ("CONFIRMED".equals(beforeStatus)) {
            return;
        }
        bookingConfirmationMailService.sendConfirmationMail(booking, trigger);
    }

    private void validateCancellationDeadline(BookingListItemResponse booking) {
        if (booking.getCheckInDate() == null) {
            return;
        }
        LocalDate latestCancellationDate = booking.getCheckInDate().minusDays(1);
        if (LocalDate.now(VIETNAM_ZONE).isAfter(latestCancellationDate)) {
            throw new AppException("Đơn đặt phòng chỉ được hủy trước ngày nhận phòng ít nhất 1 ngày");
        }
    }

    private void refundPaidVnpayPaymentIfNeeded(Integer bookingId) {
        BookingJdbcRepository.PaymentRefundInfo payment = bookingRepository.findLatestPaymentForRefund(bookingId);
        if (payment == null) {
            return;
        }

        String method = nullToEmpty(payment.getPaymentMethod()).toUpperCase(Locale.ROOT);
        String status = nullToEmpty(payment.getPaymentStatus()).toUpperCase(Locale.ROOT);
        if (!PAYMENT_METHOD_VNPAY.equals(method) || !"PAID".equals(status)) {
            return;
        }

        BigDecimal refundAmount = defaultMoney(payment.getAmount()).setScale(2, RoundingMode.HALF_UP);
        if (refundAmount.compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }

        String refundCode = "RF" + payment.getPaymentId() + nowInVietnam().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        bookingRepository.markVnpayPaymentRefunded(
                bookingId,
                payment.getPaymentId(),
                refundAmount,
                refundCode,
                "AUTO_REFUND_ON_BOOKING_CANCEL"
        );
    }
    private String normalizeHostStatus(String status) {
        String normalized = status == null ? "" : status.trim().toUpperCase(Locale.ROOT);
        if (Set.of("CONFIRMED", "CANCELLED", "COMPLETED", "NO_SHOW").contains(normalized)) {
            return normalized;
        }
        throw new AppException("Tráº¡ng thĂ¡i booking khĂ´ng há»£p lá»‡");
    }

    private String normalizePaymentMethod(String method) {
        String normalized = method == null ? "" : method.trim().toUpperCase(Locale.ROOT);
        if (PAYMENT_METHOD_VNPAY.equals(normalized) || PAYMENT_METHOD_PAY_AT_PROPERTY.equals(normalized)) return normalized;
        throw new AppException("Phương thức thanh toán không hợp lệ");
    }

    private String generateBookingCode() {
        return "BK" + nowInVietnam().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")) + UUID.randomUUID().toString().substring(0, 4).toUpperCase(Locale.ROOT);
    }

    private String buildVnpayPaymentUrl(Integer paymentId, BigDecimal amount, String clientIp) {
        return vnpayService.createPaymentUrl(paymentId.longValue(), amount, "Thanh toan booking Cozygo " + paymentId, clientIp);
    }

    private void validatePendingVnpayPayment(BookingJdbcRepository.PaymentWebhookInfo payment, BigDecimal expectedAmount) {
        String currentPaymentStatus = nullToEmpty(payment.getPaymentStatus()).toUpperCase(Locale.ROOT);
        String currentBookingStatus = nullToEmpty(payment.getBookingStatus()).toUpperCase(Locale.ROOT);
        if ("PAID".equals(currentPaymentStatus)) {
            return;
        }
        if (!"PENDING".equals(currentPaymentStatus) || !"PAYMENT_PENDING".equals(currentBookingStatus)) {
            throw new AppException("Giao dịch không còn ở trạng thái chờ thanh toán");
        }
        if (payment.getExpiresAt() != null && payment.getExpiresAt().isBefore(nowInVietnam())) {
            bookingRepository.expirePaymentBooking(payment.getBookingId());
            throw new AppException("Giao dịch đã quá hạn thanh toán");
        }
        if (payment.getAmount().compareTo(expectedAmount) != 0) {
            throw new AppException("Số tiền thanh toán không khớp với booking");
        }
    }

    private BigDecimal parseVnpayAmount(String rawAmount) {
        if (rawAmount == null || rawAmount.isBlank()) {
            throw new AppException("Thiếu số tiền VNPAY");
        }
        return new BigDecimal(rawAmount).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
    }

    private LocalDateTime parseVnpayPayDate(String value) {
        if (value == null || value.isBlank()) {
            return nowInVietnam();
        }
        try {
            return LocalDateTime.parse(value, DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        } catch (Exception exception) {
            return nowInVietnam();
        }
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

    private LocalDateTime nowInVietnam() {
        return LocalDateTime.now(VIETNAM_ZONE);
    }

    private record AppliedPromotion(Integer promotionId, String code, BigDecimal discountAmount) {}
}


