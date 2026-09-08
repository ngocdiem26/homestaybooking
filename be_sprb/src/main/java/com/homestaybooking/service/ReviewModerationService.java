package com.homestaybooking.service;

import com.homestaybooking.dto.response.ReviewModerationResult;
import com.homestaybooking.dto.response.ReviewResponse;
import com.homestaybooking.repository.ReviewJdbcRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ReviewModerationService {
    private final VietnameseRuleBasedModerationService ruleModerationService;
    private final OpenAiModerationClient openAiModerationClient;
    private final ReviewModerationDecisionService decisionService;
    private final ReviewJdbcRepository reviewRepository;
    private final ReviewModerationMailService mailService;

    public ReviewResponse moderateAndApply(ReviewResponse review) {
        ReviewModerationResult ruleResult = ruleModerationService.analyze(review.getComment(), review.getRating());
        ReviewModerationResult openAiResult = openAiModerationClient.moderateText(review.getComment());
        ReviewModerationResult finalResult = decisionService.decide(ruleResult, openAiResult);

        reviewRepository.updateModeration(review.getReviewId(), finalResult);
        reviewRepository.insertModerationLog(review.getReviewId(), ruleResult);
        reviewRepository.insertModerationLog(review.getReviewId(), openAiResult);
        reviewRepository.insertModerationLog(review.getReviewId(), finalResult);

        ReviewResponse updated = reviewRepository.findById(review.getReviewId());
        if ("PENDING".equalsIgnoreCase(updated.getAdminReviewStatus())) {
            mailService.notifyAdmin(updated);
        }
        return updated;
    }
}
