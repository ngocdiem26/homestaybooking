package com.homestaybooking.controller;

import com.homestaybooking.dto.request.AdminReviewDecisionRequest;
import com.homestaybooking.dto.request.ReviewCreateRequest;
import com.homestaybooking.dto.request.ReviewReplyRequest;
import com.homestaybooking.dto.request.ReviewUpdateRequest;
import com.homestaybooking.dto.request.UpdateReviewStatusRequest;
import com.homestaybooking.dto.response.ReviewEligibilityResponse;
import com.homestaybooking.dto.response.ReviewModerationLogResponse;
import com.homestaybooking.dto.response.ReviewResponse;
import com.homestaybooking.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class ReviewController {
    private final ReviewService reviewService;

    @GetMapping("/api/public/homestays/{homeId}/reviews")
    public List<ReviewResponse> getPublicReviews(@PathVariable Integer homeId) {
        return reviewService.getPublicReviews(homeId);
    }

    @GetMapping("/api/public/reviews/featured")
    public List<ReviewResponse> getFeaturedReviews() {
        return reviewService.getFeaturedReviews();
    }

    @GetMapping("/api/reviews/eligibility")
    public ReviewEligibilityResponse getEligibility(@RequestParam Integer homeId, @RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        return reviewService.getEligibility(homeId, authorizationHeader);
    }

    @PostMapping({"/api/reviews", "/api/customer/reviews"})
    public ReviewResponse createReview(@RequestBody ReviewCreateRequest request, @RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        return reviewService.createReview(request, authorizationHeader);
    }

    @GetMapping({"/api/reviews/me", "/api/customer/reviews/my"})
    public List<ReviewResponse> getMyReviews(@RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        return reviewService.getMyReviews(authorizationHeader);
    }

    @PutMapping({"/api/reviews/{reviewId}", "/api/customer/reviews/{reviewId}"})
    public ReviewResponse updateMyReview(@PathVariable Integer reviewId, @RequestBody ReviewUpdateRequest request, @RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        return reviewService.updateMyReview(reviewId, request, authorizationHeader);
    }

    @GetMapping("/api/admin/reviews")
    public List<ReviewResponse> getAdminReviews(@RequestParam(value = "tab", required = false) String tab, @RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        return reviewService.getAdminReviews(tab, authorizationHeader);
    }

    @GetMapping("/api/admin/reviews/counts")
    public Map<String, Integer> getAdminReviewCounts(@RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        return reviewService.getAdminReviewCounts(authorizationHeader);
    }

    @GetMapping("/api/admin/reviews/{reviewId}")
    public ReviewResponse getAdminReviewDetail(@PathVariable Integer reviewId, @RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        return reviewService.getAdminReviewDetail(reviewId, authorizationHeader);
    }

    @GetMapping("/api/admin/reviews/{reviewId}/logs")
    public List<ReviewModerationLogResponse> getModerationLogs(@PathVariable Integer reviewId, @RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        return reviewService.getModerationLogs(reviewId, authorizationHeader);
    }

    @PutMapping("/api/admin/reviews/{reviewId}/keep-visible")
    public ReviewResponse keepReviewVisible(@PathVariable Integer reviewId, @RequestBody(required = false) AdminReviewDecisionRequest request, @RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        return reviewService.keepReviewVisible(reviewId, request == null ? null : request.getReason(), authorizationHeader);
    }

    @PutMapping("/api/admin/reviews/{reviewId}/hide")
    public ReviewResponse hideReview(@PathVariable Integer reviewId, @RequestBody(required = false) AdminReviewDecisionRequest request, @RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        return reviewService.hideReview(reviewId, request == null ? null : request.getReason(), authorizationHeader);
    }

    @PutMapping("/api/admin/reviews/{reviewId}/reject")
    public ReviewResponse rejectReview(@PathVariable Integer reviewId, @RequestBody(required = false) AdminReviewDecisionRequest request, @RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        return reviewService.rejectReview(reviewId, request == null ? null : request.getReason(), authorizationHeader);
    }

    @PutMapping("/api/admin/reviews/{reviewId}/restore")
    public ReviewResponse restoreReview(@PathVariable Integer reviewId, @RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        return reviewService.restoreReview(reviewId, authorizationHeader);
    }

    @PatchMapping("/api/admin/reviews/{reviewId}/status")
    public ReviewResponse updateAdminReviewStatus(@PathVariable Integer reviewId, @RequestBody UpdateReviewStatusRequest request, @RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        return reviewService.updateAdminReviewStatus(reviewId, request.getStatus(), authorizationHeader);
    }

    @DeleteMapping("/api/admin/reviews/{reviewId}")
    public void deleteAdminReview(@PathVariable Integer reviewId, @RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        reviewService.deleteAdminReview(reviewId, authorizationHeader);
    }

    @PostMapping("/api/host/reviews/{reviewId}/reply")
    public ReviewResponse replyToHostReview(@PathVariable Integer reviewId, @RequestBody ReviewReplyRequest request, @RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        return reviewService.replyToHostReview(reviewId, request.getContent(), authorizationHeader);
    }

    @GetMapping("/api/host/reviews")
    public List<ReviewResponse> getHostReviews(@RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        return reviewService.getHostReviews(authorizationHeader);
    }
}
