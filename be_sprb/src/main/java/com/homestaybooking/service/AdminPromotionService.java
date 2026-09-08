package com.homestaybooking.service;

import com.homestaybooking.dto.request.PromotionRequest;
import com.homestaybooking.dto.request.UpdatePromotionStatusRequest;
import com.homestaybooking.dto.response.AdminPromotionResponse;
import com.homestaybooking.dto.response.PromotionTargetOptionResponse;
import com.homestaybooking.dto.response.PromotionTargetOptionsResponse;
import com.homestaybooking.entity.Promotion;
import com.homestaybooking.exception.AppException;
import com.homestaybooking.repository.PromotionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class AdminPromotionService {

    private static final Set<String> VALID_SCOPES = Set.of(
            "GLOBAL", "HOMESTAY", "USER", "TIER", "HOMESTAY_USER", "HOMESTAY_TIER"
    );
    private static final Pattern TARGET_CODE_NUMBER_PATTERN = Pattern.compile("(\\d+)");

    private final PromotionRepository promotionRepository;
    private final JdbcTemplate jdbcTemplate;

    @Transactional(readOnly = true)
    public List<AdminPromotionResponse> getPromotions() {
        return promotionRepository.findAll().stream()
                .sorted(Comparator.comparing(Promotion::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public PromotionTargetOptionsResponse getTargetOptions() {
        return PromotionTargetOptionsResponse.builder()
                .users(loadUserOptions())
                .homestays(loadHomestayOptions())
                .tiers(loadTierOptions())
                .build();
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
        Promotion savedPromotion = promotionRepository.saveAndFlush(promotion);
        syncTargets(savedPromotion.getPromotionId(), savedPromotion.getPromotionScope(), request);
        return toResponse(savedPromotion);
    }

    @Transactional
    public AdminPromotionResponse updatePromotion(Integer promotionId, PromotionRequest request) {
        Promotion promotion = getPromotion(promotionId);
        applyRequest(promotion, request, false);
        Promotion savedPromotion = promotionRepository.saveAndFlush(promotion);
        syncTargets(savedPromotion.getPromotionId(), savedPromotion.getPromotionScope(), request);
        return toResponse(savedPromotion);
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
        String scope = normalizeScope(request.getPromotionScope());
        String discountType = normalizeDiscountType(request.getDiscountType());
        BigDecimal discountValue = normalizePositiveMoney(request.getDiscountValue(), "Giá trị giảm phải lớn hơn 0");
        LocalDate startDate = request.getStartDate();
        LocalDate endDate = request.getEndDate();
        boolean tierPromotion = requiresTiers(scope);

        if (tierPromotion) {
            startDate = null;
            endDate = null;
        } else {
            if (startDate == null || endDate == null) {
                throw new AppException("Ngày bắt đầu và ngày kết thúc không được để trống");
            }

            if (endDate.isBefore(startDate)) {
                throw new AppException("Ngày kết thúc phải sau hoặc bằng ngày bắt đầu");
            }
        }
        if (discountType.equals("PERCENT") && discountValue.compareTo(BigDecimal.valueOf(100)) > 0) {
            throw new AppException("Giá trị phần trăm không được vượt quá 100");
        }

        validateScopeTargets(scope, request);

        promotion.setPromotionName(name);
        promotion.setPromotionScope(scope);
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

    private void validateScopeTargets(String scope, PromotionRequest request) {
        List<Integer> userIds = normalizeTargetIds(request.getUserIds(), request.getUserCodes(), "ma khach hang");
        List<Integer> homeIds = normalizeTargetIds(request.getHomeIds(), request.getHomeCodes(), "ma homestay");
        List<Integer> tierIds = normalizeIds(request.getTierIds());

        if (requiresUsers(scope) && userIds.isEmpty()) {
            throw new AppException("Vui lòng chọn ít nhất một khách hàng cho phạm vi mã này");
        }
        if (requiresHomestays(scope) && homeIds.isEmpty()) {
            throw new AppException("Vui lòng chọn ít nhất một homestay cho phạm vi mã này");
        }
        if (requiresTiers(scope) && tierIds.isEmpty()) {
            throw new AppException("Vui lòng chọn ít nhất một hạng thành viên cho phạm vi mã này");
        }

        assertExistingIds(userIds, "users", "user_id", "Có khách hàng không tồn tại");
        assertExistingIds(homeIds, "homestays", "home_id", "Có homestay không tồn tại");
        assertExistingIds(tierIds, "loyalty_tiers", "tier_id", "Có hạng thành viên không tồn tại");
    }

    private void syncTargets(Integer promotionId, String scope, PromotionRequest request) {
        if (requiresUsers(scope)) {
            jdbcTemplate.update("delete from promotion_users where promotion_id = ?", promotionId);
        }
        jdbcTemplate.update("delete from promotion_homestays where promotion_id = ?", promotionId);
        jdbcTemplate.update("delete from promotion_tiers where promotion_id = ?", promotionId);

        if (requiresUsers(scope)) {
            insertUserLinks(promotionId, normalizeTargetIds(request.getUserIds(), request.getUserCodes(), "ma khach hang"), request.getUsageLimitPerUser());
        }
        if (requiresHomestays(scope)) {
            insertLinks("promotion_homestays", "home_id", promotionId, normalizeTargetIds(request.getHomeIds(), request.getHomeCodes(), "ma homestay"));
        }
        if (requiresTiers(scope)) {
            insertTierLinks(promotionId, normalizeIds(request.getTierIds()));
        }
    }
    private void insertLinks(String tableName, String targetColumn, Integer promotionId, List<Integer> ids) {
        String sql = "insert into " + tableName + " (promotion_id, " + targetColumn + ") values (?, ?)";
        jdbcTemplate.batchUpdate(sql, ids, ids.size(), (ps, id) -> {
            ps.setInt(1, promotionId);
            ps.setInt(2, id);
        });
    }

    private void insertUserLinks(Integer promotionId, List<Integer> userIds, Integer usageLimitPerUser) {
        int usageLimit = usageLimitPerUser == null || usageLimitPerUser <= 0 ? 1 : usageLimitPerUser;
        String sql = "insert into promotion_users "
                + "(promotion_id, user_id, user_promotion_status, granted_reason, usage_limit, used_count) "
                + "values (?, ?, 'ACTIVE', 'ADMIN_GRANT', ?, 0)";
        jdbcTemplate.batchUpdate(sql, userIds, userIds.size(), (ps, id) -> {
            ps.setInt(1, promotionId);
            ps.setInt(2, id);
            ps.setInt(3, usageLimit);
        });
    }

    private void insertTierLinks(Integer promotionId, List<Integer> tierIds) {
        String sql = "insert into promotion_tiers (promotion_id, tier_id, validity_days) "
                + "select ?, tier_id, case upper(coalesce(tier_code, '')) "
                + "when 'BRONZE' then 30 "
                + "when 'SILVER' then 90 "
                + "when 'GOLD' then 180 "
                + "when 'DIAMOND' then 270 "
                + "else 30 end "
                + "from loyalty_tiers where tier_id = ?";
        jdbcTemplate.batchUpdate(sql, tierIds, tierIds.size(), (ps, id) -> {
            ps.setInt(1, promotionId);
            ps.setInt(2, id);
        });
    }

    private List<Integer> normalizeIds(List<Integer> ids) {
        if (ids == null) {
            return List.of();
        }
        return new ArrayList<>(ids.stream()
                .filter(id -> id != null && id > 0)
                .collect(java.util.stream.Collectors.toCollection(LinkedHashSet::new)));
    }

    private List<Integer> normalizeTargetIds(List<Integer> ids, List<String> codes, String label) {
        LinkedHashSet<Integer> normalized = new LinkedHashSet<>(normalizeIds(ids));
        if (codes != null) {
            for (String code : codes) {
                Integer parsedId = parseTargetCode(code, label);
                if (parsedId != null && parsedId > 0) {
                    normalized.add(parsedId);
                }
            }
        }
        return new ArrayList<>(normalized);
    }

    private Integer parseTargetCode(String code, String label) {
        if (code == null || code.isBlank()) {
            return null;
        }
        Matcher matcher = TARGET_CODE_NUMBER_PATTERN.matcher(code.trim());
        String number = null;
        while (matcher.find()) {
            number = matcher.group(1);
        }
        if (number == null) {
            throw new AppException("Khong doc duoc " + label + ": " + code);
        }
        try {
            return Integer.parseInt(number);
        } catch (NumberFormatException exception) {
            throw new AppException("Khong doc duoc " + label + ": " + code);
        }
    }

    private void assertExistingIds(List<Integer> ids, String tableName, String idColumn, String errorMessage) {
        if (ids.isEmpty()) {
            return;
        }
        String placeholders = String.join(",", ids.stream().map(id -> "?").toList());
        String sql = "select count(*) from " + tableName + " where " + idColumn + " in (" + placeholders + ")";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, ids.toArray());
        if (count == null || count != ids.size()) {
            throw new AppException(errorMessage);
        }
    }

    private List<PromotionTargetOptionResponse> loadUserOptions() {
        return jdbcTemplate.query(
                "select u.user_id id, concat('USR-', lpad(u.user_id, 3, '0')) code, u.full_name label, u.email sub_label "
                        + "from users u join roles r on r.role_id = u.role_id "
                        + "where u.deleted_at is null and upper(coalesce(u.user_status, 'ACTIVE')) = 'ACTIVE' "
                        + "and upper(coalesce(r.role_name, '')) = 'CUSTOMER' "
                        + "order by u.full_name asc, u.user_id desc",
                (rs, rowNum) -> option(rs.getInt("id"), rs.getString("code"), rs.getString("label"), rs.getString("sub_label"))
        );
    }

    private List<PromotionTargetOptionResponse> loadHomestayOptions() {
        return jdbcTemplate.query(
                "select h.home_id id, concat('HMS-', lpad(h.home_id, 3, '0')) code, h.home_name label, concat(coalesce(h.province, ''), case when h.city is null or h.city = '' then '' else concat(' - ', h.city) end) sub_label "
                        + "from homestays h where h.deleted_at is null "
                        + "order by h.home_name asc, h.home_id desc",
                (rs, rowNum) -> option(rs.getInt("id"), rs.getString("code"), rs.getString("label"), rs.getString("sub_label"))
        );
    }

    private List<PromotionTargetOptionResponse> loadTierOptions() {
        return jdbcTemplate.query(
                "select tier_id id, concat('TIER-', lpad(tier_id, 3, '0')) code, tier_name label, tier_code sub_label "
                        + "from loyalty_tiers where upper(coalesce(tier_status, 'ACTIVE')) = 'ACTIVE' "
                        + "order by display_order asc, tier_id asc",
                (rs, rowNum) -> option(rs.getInt("id"), rs.getString("code"), rs.getString("label"), rs.getString("sub_label"))
        );
    }

    private PromotionTargetOptionResponse option(Integer id, String code, String label, String subLabel) {
        return PromotionTargetOptionResponse.builder()
                .id(id)
                .code(code)
                .label(label)
                .subLabel(subLabel)
                .build();
    }

    private List<Integer> loadLinkedIds(String tableName, String idColumn, Integer promotionId) {
        return jdbcTemplate.query(
                "select " + idColumn + " from " + tableName + " where promotion_id = ? order by " + idColumn,
                (rs, rowNum) -> rs.getInt(idColumn),
                promotionId
        );
    }

    private List<PromotionTargetOptionResponse> loadAssignedUsers(Integer promotionId) {
        return jdbcTemplate.query(
                "select u.user_id id, concat('USR-', lpad(u.user_id, 3, '0')) code, u.full_name label, u.email sub_label "
                        + "from promotion_users pu join users u on u.user_id = pu.user_id "
                        + "where pu.promotion_id = ? order by u.full_name asc",
                (rs, rowNum) -> option(rs.getInt("id"), rs.getString("code"), rs.getString("label"), rs.getString("sub_label")),
                promotionId
        );
    }

    private List<PromotionTargetOptionResponse> loadAssignedHomestays(Integer promotionId) {
        return jdbcTemplate.query(
                "select h.home_id id, concat('HMS-', lpad(h.home_id, 3, '0')) code, h.home_name label, concat(coalesce(h.province, ''), case when h.city is null or h.city = '' then '' else concat(' - ', h.city) end) sub_label "
                        + "from promotion_homestays ph join homestays h on h.home_id = ph.home_id "
                        + "where ph.promotion_id = ? order by h.home_name asc",
                (rs, rowNum) -> option(rs.getInt("id"), rs.getString("code"), rs.getString("label"), rs.getString("sub_label")),
                promotionId
        );
    }

    private List<PromotionTargetOptionResponse> loadAssignedTiers(Integer promotionId) {
        return jdbcTemplate.query(
                "select lt.tier_id id, concat('TIER-', lpad(lt.tier_id, 3, '0')) code, lt.tier_name label, lt.tier_code sub_label "
                        + "from promotion_tiers pt join loyalty_tiers lt on lt.tier_id = pt.tier_id "
                        + "where pt.promotion_id = ? order by lt.display_order asc, lt.tier_id asc",
                (rs, rowNum) -> option(rs.getInt("id"), rs.getString("code"), rs.getString("label"), rs.getString("sub_label")),
                promotionId
        );
    }

    private boolean requiresUsers(String scope) {
        return scope.equals("USER") || scope.equals("HOMESTAY_USER");
    }

    private boolean requiresHomestays(String scope) {
        return scope.equals("HOMESTAY") || scope.equals("HOMESTAY_USER") || scope.equals("HOMESTAY_TIER");
    }

    private boolean requiresTiers(String scope) {
        return scope.equals("TIER") || scope.equals("HOMESTAY_TIER");
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

    private String normalizeScope(String scope) {
        String normalizedScope = scope == null || scope.isBlank() ? "GLOBAL" : scope.trim().toUpperCase();
        if (!VALID_SCOPES.contains(normalizedScope)) {
            throw new AppException("Phạm vi áp dụng khuyến mãi không hợp lệ");
        }
        return normalizedScope;
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
        Integer promotionId = promotion.getPromotionId();
        return AdminPromotionResponse.builder()
                .promotionId(promotionId)
                .promotionName(promotion.getPromotionName())
                .promotionCode(promotion.getPromotionCode())
                .promotionScope(promotion.getPromotionScope() == null ? "GLOBAL" : promotion.getPromotionScope())
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
                .userIds(loadLinkedIds("promotion_users", "user_id", promotionId))
                .homeIds(loadLinkedIds("promotion_homestays", "home_id", promotionId))
                .tierIds(loadLinkedIds("promotion_tiers", "tier_id", promotionId))
                .assignedUsers(loadAssignedUsers(promotionId))
                .assignedHomestays(loadAssignedHomestays(promotionId))
                .assignedTiers(loadAssignedTiers(promotionId))
                .build();
    }
}
