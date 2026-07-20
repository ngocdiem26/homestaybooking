package com.homestaybooking.service;

import com.homestaybooking.dto.request.ReviewCreateRequest;
import com.homestaybooking.dto.request.ReviewUpdateRequest;
import com.homestaybooking.dto.response.ReviewEligibilityResponse;
import com.homestaybooking.dto.response.ReviewModerationLogResponse;
import com.homestaybooking.dto.response.ReviewResponse;
import com.homestaybooking.entity.User;
import com.homestaybooking.exception.AppException;
import com.homestaybooking.repository.ReviewJdbcRepository;
import com.homestaybooking.repository.UserRepository;
import com.homestaybooking.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewJdbcRepository reviewRepository;
    private final ReviewModerationService reviewModerationService;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    @Transactional(readOnly = true)
    public List<ReviewResponse> getPublicReviews(Integer homeId) {
        return reviewRepository.findPublicReviews(homeId);
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getFeaturedReviews() {
        return reviewRepository.findFeaturedReviews(6);
    }

    @Transactional(readOnly = true)
    public ReviewEligibilityResponse getEligibility(Integer homeId, String authorizationHeader) {
        User user = resolveUser(authorizationHeader);
        ReviewJdbcRepository.ReviewEligibilityInfo eligibleBooking = reviewRepository.findEligibleBooking(user.getUserId(), homeId);
        if (eligibleBooking == null) {
            String reason = reviewRepository.hasAnyCompletedBooking(user.getUserId(), homeId)
                    ? "Không tìm thấy đơn phù hợp để đánh giá"
                    : "Chỉ khách đã hoàn thành đơn đặt homestay này mới được đánh giá";
            return ReviewEligibilityResponse.builder().canReview(false).reason(reason).build();
        }

        return ReviewEligibilityResponse.builder()
                .canReview(true)
                .reason("Bạn có thể đánh giá homestay này")
                .bookingId(eligibleBooking.getBookingId())
                .build();
    }

    @Transactional
    public ReviewResponse createReview(ReviewCreateRequest request, String authorizationHeader) {
        User user = resolveUser(authorizationHeader);
        Integer homeId = request.getHomeId();
        Integer bookingId = request.getBookingId();
        if (homeId == null) throw new AppException("Thiếu homestay cần đánh giá");
        if (bookingId == null) throw new AppException("Thiếu đơn đặt phòng cần đánh giá");
        validateReviewInput(request.getRating(), request.getComment());
        if (reviewRepository.hasReviewedBooking(user.getUserId(), bookingId)) {
            throw new AppException("Bạn đã đánh giá đơn đặt này rồi");
        }

        ReviewJdbcRepository.ReviewEligibilityInfo eligibleBooking = reviewRepository.findEligibleBooking(user.getUserId(), homeId, bookingId);
        if (eligibleBooking == null) {
            throw new AppException("Chỉ khách đã hoàn thành đơn đặt homestay này mới được đánh giá");
        }

        ReviewResponse created = reviewRepository.insertReview(
                user.getUserId(),
                homeId,
                eligibleBooking.getBookingId(),
                request.getRating(),
                request.getComment().trim()
        );
        return reviewModerationService.moderateAndApply(created);
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getMyReviews(String authorizationHeader) {
        User user = resolveUser(authorizationHeader);
        return reviewRepository.findUserReviews(user.getUserId());
    }

    @Transactional
    public ReviewResponse updateMyReview(Integer reviewId, ReviewUpdateRequest request, String authorizationHeader) {
        User user = resolveUser(authorizationHeader);
        validateReviewInput(request.getRating(), request.getComment());
        ReviewResponse updated = reviewRepository.updateUserReview(reviewId, user.getUserId(), request.getRating(), request.getComment().trim());
        return reviewModerationService.moderateAndApply(updated);
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getAdminReviews(String tab, String authorizationHeader) {
        requireRole(resolveUser(authorizationHeader), Set.of("ADMIN"));
        return reviewRepository.findAdminReviews(tab);
    }

    @Transactional(readOnly = true)
    public Map<String, Integer> getAdminReviewCounts(String authorizationHeader) {
        requireRole(resolveUser(authorizationHeader), Set.of("ADMIN"));
        return reviewRepository.countAdminReviewTabs();
    }

    @Transactional(readOnly = true)
    public ReviewResponse getAdminReviewDetail(Integer reviewId, String authorizationHeader) {
        requireRole(resolveUser(authorizationHeader), Set.of("ADMIN"));
        return reviewRepository.findById(reviewId);
    }

    @Transactional(readOnly = true)
    public List<ReviewModerationLogResponse> getModerationLogs(Integer reviewId, String authorizationHeader) {
        requireRole(resolveUser(authorizationHeader), Set.of("ADMIN"));
        return reviewRepository.findModerationLogs(reviewId);
    }

    @Transactional
    public ReviewResponse keepReviewVisible(Integer reviewId, String reason, String authorizationHeader) {
        User admin = resolveUser(authorizationHeader);
        requireRole(admin, Set.of("ADMIN"));
        reviewRepository.updateAdminDecision(reviewId, "VISIBLE", "RESOLVED", safeReason(reason, "Admin đã duyệt giữ hiển thị đánh giá."), admin.getUserId(), "KEEP_VISIBLE");
        return reviewRepository.findById(reviewId);
    }

    @Transactional
    public ReviewResponse hideReview(Integer reviewId, String reason, String authorizationHeader) {
        User admin = resolveUser(authorizationHeader);
        requireRole(admin, Set.of("ADMIN"));
        reviewRepository.updateAdminDecision(reviewId, "HIDDEN", "RESOLVED", safeReason(reason, "Admin đã ẩn đánh giá sau khi xem xét."), admin.getUserId(), "HIDE");
        return reviewRepository.findById(reviewId);
    }

    @Transactional
    public ReviewResponse rejectReview(Integer reviewId, String reason, String authorizationHeader) {
        User admin = resolveUser(authorizationHeader);
        requireRole(admin, Set.of("ADMIN"));
        reviewRepository.updateAdminDecision(reviewId, "REJECTED", "REJECTED", safeReason(reason, "Đánh giá bị từ chối do vi phạm quy định cộng đồng."), admin.getUserId(), "REJECT");
        return reviewRepository.findById(reviewId);
    }

    @Transactional
    public ReviewResponse restoreReview(Integer reviewId, String authorizationHeader) {
        User admin = resolveUser(authorizationHeader);
        requireRole(admin, Set.of("ADMIN"));
        reviewRepository.updateAdminDecision(reviewId, "VISIBLE", "RESOLVED", "Admin đã khôi phục hiển thị đánh giá.", admin.getUserId(), "RESTORE");
        return reviewRepository.findById(reviewId);
    }

    @Transactional
    public ReviewResponse updateAdminReviewStatus(Integer reviewId, String status, String authorizationHeader) {
        String normalized = normalizeStatus(status);
        if ("VISIBLE".equals(normalized)) return keepReviewVisible(reviewId, "Admin đã duyệt giữ hiển thị đánh giá.", authorizationHeader);
        return hideReview(reviewId, "Admin đã ẩn đánh giá sau khi xem xét.", authorizationHeader);
    }

    @Transactional
    public void deleteAdminReview(Integer reviewId, String authorizationHeader) {
        requireRole(resolveUser(authorizationHeader), Set.of("ADMIN"));
        reviewRepository.softDelete(reviewId);
    }

    @Transactional
    public ReviewResponse replyToHostReview(Integer reviewId, String content, String authorizationHeader) {
        User host = resolveUser(authorizationHeader);
        requireRole(host, Set.of("HOST", "ADMIN"));
        if (content == null || content.trim().length() < 2) {
            throw new AppException("Nội dung phản hồi cần ít nhất 2 ký tự");
        }
        if (!reviewRepository.isReviewOwnedByHost(reviewId, host.getUserId()) && !"ADMIN".equalsIgnoreCase(host.getRole() == null ? "" : host.getRole().getRoleName())) {
            throw new AppException("Bạn không có quyền phản hồi đánh giá này");
        }
        return reviewRepository.saveHostReply(reviewId, host.getUserId(), content.trim());
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getHostReviews(String authorizationHeader) {
        User host = resolveUser(authorizationHeader);
        requireRole(host, Set.of("HOST", "ADMIN"));
        return reviewRepository.findHostReviews(host.getUserId());
    }

    private void validateReviewInput(Integer rating, String comment) {
        if (rating == null || rating < 1 || rating > 5) throw new AppException("Số sao đánh giá phải từ 1 đến 5");
        if (comment == null || comment.trim().length() < 10) throw new AppException("Nội dung đánh giá cần ít nhất 10 ký tự");
    }

    private User resolveUser(String authorizationHeader) {
        String email = jwtUtil.extractEmailFromAuthorizationHeader(authorizationHeader);
        if (email == null) throw new AppException("Vui lòng đăng nhập để sử dụng chức năng đánh giá");
        return userRepository.findByEmail(email).orElseThrow(() -> new AppException("Không tìm thấy tài khoản đang đăng nhập"));
    }

    private void requireRole(User user, Set<String> roles) {
        String roleName = user.getRole() == null ? "" : user.getRole().getRoleName();
        if (!roles.contains(roleName == null ? "" : roleName.toUpperCase(Locale.ROOT))) {
            throw new AppException("Bạn không có quyền truy cập chức năng này");
        }
    }

    private String normalizeStatus(String status) {
        String normalized = status == null ? "" : status.trim().toUpperCase(Locale.ROOT);
        if (Set.of("VISIBLE", "HIDDEN").contains(normalized)) return normalized;
        throw new AppException("Trạng thái đánh giá không hợp lệ");
    }

    private String safeReason(String reason, String fallback) {
        return reason == null || reason.isBlank() ? fallback : reason.trim();
    }
}
