package com.homestaybooking.service;

import com.homestaybooking.dto.request.PromotionRequest;
import com.homestaybooking.dto.request.UpdatePromotionStatusRequest;
import com.homestaybooking.dto.response.AdminPromotionResponse;
import com.homestaybooking.entity.Promotion;
import com.homestaybooking.exception.AppException;
import com.homestaybooking.repository.PromotionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminPromotionService {

    private final PromotionRepository promotionRepository;

    @Transactional(readOnly = true)
    public List<AdminPromotionResponse> getPromotions() {
        return promotionRepository.findAll().stream()
                .sorted(Comparator.comparing(Promotion::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public AdminPromotionResponse createPromotion(PromotionRequest request) {
        String code = normalizeCode(request.getPromotionCode());

        if (promotionRepository.existsByPromotionCode(code)) {
            throw new AppException("Mã khuyến mãi đã tồn tại");
        }

        Promotion promotion = Promotion.builder()
                .promotionCode(code)
                .build();

        applyRequest(promotion, request, true);
        return toResponse(promotionRepository.save(promotion));
    }

    @Transactional
    public AdminPromotionResponse updatePromotion(Integer promotionId, PromotionRequest request) {
        Promotion promotion = getPromotion(promotionId);
        applyRequest(promotion, request, false);
        return toResponse(promotionRepository.save(promotion));
    }

    @Transactional
    public AdminPromotionResponse updateStatus(Integer promotionId, UpdatePromotionStatusRequest request) {
        Promotion promotion = getPromotion(promotionId);
        promotion.setStatus(normalizeStatus(request.getStatus()));
        return toResponse(promotionRepository.save(promotion));
    }

    @Transactional
    public void deletePromotion(Integer promotionId) {
        Promotion promotion = getPromotion(promotionId);

        try {
            promotionRepository.delete(promotion);
            promotionRepository.flush();
        } catch (DataIntegrityViolationException exception) {
            throw new AppException("Không thể xóa mã đã phát sinh booking. Hãy chuyển trạng thái mã sang Ngưng.");
        }
    }

    private void applyRequest(Promotion promotion, PromotionRequest request, boolean isCreate) {
        String name = normalizeRequiredText(request.getPromotionName(), "Tên chương trình không được để trống");
        String discountType = normalizeDiscountType(request.getDiscountType());
        BigDecimal discountValue = normalizePositiveMoney(request.getDiscountValue(), "Giá trị giảm phải lớn hơn 0");
        LocalDate startDate = request.getStartDate();
        LocalDate endDate = request.getEndDate();

        if (startDate == null || endDate == null) {
            throw new AppException("Ngày bắt đầu và ngày kết thúc không được để trống");
        }

        if (endDate.isBefore(startDate)) {
            throw new AppException("Ngày kết thúc phải sau hoặc bằng ngày bắt đầu");
        }

        if (discountType.equals("PERCENT") && discountValue.compareTo(BigDecimal.valueOf(100)) > 0) {
            throw new AppException("Giá trị phần trăm không được vượt quá 100");
        }

        promotion.setPromotionName(name);
        promotion.setDiscountType(discountType);
        promotion.setDiscountValue(discountValue);
        promotion.setStartDate(startDate);
        promotion.setEndDate(endDate);
        promotion.setPromotionDescription(blankToNull(request.getPromotionDescription()));
        promotion.setMaxDiscount(normalizeOptionalMoney(request.getMaxDiscount(), "Giảm tối đa không hợp lệ"));
        promotion.setMinOrderAmount(defaultZero(request.getMinOrderAmount()));
        promotion.setUsageLimitTotal(normalizeOptionalCount(request.getUsageLimitTotal(), "Tổng giới hạn lượt dùng không hợp lệ"));
        promotion.setUsageLimitPerUser(normalizeOptionalCount(request.getUsageLimitPerUser(), "Giới hạn lượt dùng mỗi khách không hợp lệ"));
        promotion.setStatus(normalizeStatus(isCreate ? request.getStatus() : request.getStatus()));
    }

    private Promotion getPromotion(Integer promotionId) {
        return promotionRepository.findById(promotionId)
                .orElseThrow(() -> new AppException("Không tìm thấy mã khuyến mãi"));
    }

    private String normalizeCode(String code) {
        String normalizedCode = normalizeRequiredText(code, "Mã khuyến mãi không được để trống").toUpperCase();

        if (normalizedCode.length() > 20) {
            throw new AppException("Mã khuyến mãi tối đa 20 ký tự");
        }

        if (!normalizedCode.matches("^[A-Z0-9_-]+$")) {
            throw new AppException("Mã khuyến mãi chỉ nên gồm chữ, số, dấu gạch ngang hoặc gạch dưới");
        }

        return normalizedCode;
    }

    private String normalizeDiscountType(String discountType) {
        String normalizedType = discountType == null ? "" : discountType.trim().toUpperCase();

        if (!normalizedType.equals("PERCENT") && !normalizedType.equals("AMOUNT")) {
            throw new AppException("Loại giảm không hợp lệ");
        }

        return normalizedType;
    }

    private String normalizeStatus(String status) {
        String normalizedStatus = status == null || status.isBlank() ? "ACTIVE" : status.trim().toUpperCase();

        if (!normalizedStatus.equals("ACTIVE") && !normalizedStatus.equals("INACTIVE")) {
            throw new AppException("Trạng thái khuyến mãi không hợp lệ");
        }

        return normalizedStatus;
    }

    private String normalizeRequiredText(String value, String errorMessage) {
        String normalizedValue = value == null ? "" : value.trim();

        if (normalizedValue.isEmpty()) {
            throw new AppException(errorMessage);
        }

        return normalizedValue;
    }

    private BigDecimal normalizePositiveMoney(BigDecimal value, String errorMessage) {
        if (value == null || value.compareTo(BigDecimal.ZERO) <= 0) {
            throw new AppException(errorMessage);
        }

        return value;
    }

    private BigDecimal normalizeOptionalMoney(BigDecimal value, String errorMessage) {
        if (value != null && value.compareTo(BigDecimal.ZERO) < 0) {
            throw new AppException(errorMessage);
        }

        return value;
    }

    private BigDecimal defaultZero(BigDecimal value) {
        if (value == null) {
            return BigDecimal.ZERO;
        }

        if (value.compareTo(BigDecimal.ZERO) < 0) {
            throw new AppException("Đơn tối thiểu không hợp lệ");
        }

        return value;
    }

    private Integer normalizeOptionalCount(Integer value, String errorMessage) {
        if (value != null && value < 0) {
            throw new AppException(errorMessage);
        }

        return value;
    }

    private String blankToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }

    private AdminPromotionResponse toResponse(Promotion promotion) {
        return AdminPromotionResponse.builder()
                .promotionId(promotion.getPromotionId())
                .promotionName(promotion.getPromotionName())
                .promotionCode(promotion.getPromotionCode())
                .discountType(promotion.getDiscountType())
                .discountValue(promotion.getDiscountValue())
                .startDate(promotion.getStartDate())
                .endDate(promotion.getEndDate())
                .createdAt(promotion.getCreatedAt())
                .updatedAt(promotion.getUpdatedAt())
                .promotionDescription(promotion.getPromotionDescription())
                .maxDiscount(promotion.getMaxDiscount())
                .minOrderAmount(promotion.getMinOrderAmount())
                .usageLimitTotal(promotion.getUsageLimitTotal())
                .usageLimitPerUser(promotion.getUsageLimitPerUser())
                .status(promotion.getStatus())
                .build();
    }
}
