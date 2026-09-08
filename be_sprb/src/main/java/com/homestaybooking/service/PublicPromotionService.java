package com.homestaybooking.service;

import com.homestaybooking.dto.response.PublicPromotionResponse;
import com.homestaybooking.entity.User;
import com.homestaybooking.repository.UserRepository;
import com.homestaybooking.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Date;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PublicPromotionService {

    private static final List<String> THEMES = List.of("EMBER", "FOREST", "LAGOON", "PLUM", "SUNRISE", "MOSS");

    private final JdbcTemplate jdbcTemplate;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final CustomerTierService customerTierService;

    @Transactional
    public List<PublicPromotionResponse> getPromotions(String authorizationHeader) {
        Integer userId = resolveUserId(authorizationHeader);
        if (userId != null) {
            customerTierService.ensureTierPromotionGrants(userId);
        }
        LocalDate today = LocalDate.now();

        String sql = """
                select p.promotion_id, p.promotion_name, p.promotion_code,
                       upper(coalesce(p.promotion_scope, 'GLOBAL')) as promotion_scope,
                       p.discount_type, p.discount_value, p.max_discount, p.min_order_amount,
                       p.start_date, p.end_date, p.promotion_description, p.status,
                       p.usage_limit_total,
                       coalesce((select max(pru.usage_limit) from promotion_users pru where pru.promotion_id = p.promotion_id and pru.user_id = ?), p.usage_limit_per_user) as effective_usage_limit_per_user,
                       (select count(*) from promotion_usages pu where pu.promotion_id = p.promotion_id) as used_count_total,
                       coalesce((select max(pru.used_count) from promotion_users pru where pru.promotion_id = p.promotion_id and pru.user_id = ?),
                                (select count(*) from promotion_usages pu where pu.promotion_id = p.promotion_id and pu.user_id = ?)) as used_count_by_user,
                       exists(
                            select 1 from promotion_users pru
                            where pru.promotion_id = p.promotion_id and pru.user_id = ?
                              and upper(coalesce(pru.user_promotion_status, 'ACTIVE')) = 'ACTIVE'
                              and pru.valid_from <= now()
                              and (pru.valid_until is null or pru.valid_until >= now())
                              and coalesce(pru.used_count, 0) < coalesce(pru.usage_limit, 1)
                       ) as assigned_to_user,
                       exists(select 1 from promotion_tiers pt where pt.promotion_id = p.promotion_id) as has_tier_rule,
                       exists(
                            select 1 from promotion_users pru
                            where pru.promotion_id = p.promotion_id and pru.user_id = ?
                              and upper(coalesce(pru.user_promotion_status, 'ACTIVE')) = 'ACTIVE'
                              and pru.valid_from <= now()
                              and (pru.valid_until is null or pru.valid_until >= now())
                              and coalesce(pru.used_count, 0) < coalesce(pru.usage_limit, 1)
                       ) as allowed_by_tier,
                       (select group_concat(distinct lt.tier_name order by lt.display_order separator ', ')
                        from promotion_tiers pt join loyalty_tiers lt on lt.tier_id = pt.tier_id
                        where pt.promotion_id = p.promotion_id) as tier_names,
                       (select group_concat(distinct h.home_name order by h.home_name separator ', ')
                        from promotion_homestays ph join homestays h on h.home_id = ph.home_id
                        where ph.promotion_id = p.promotion_id) as homestay_names
                from promotions p
                order by
                    case when upper(coalesce(p.status, 'ACTIVE')) = 'ACTIVE'
                          and (p.start_date is null or current_date >= p.start_date)
                          and (p.end_date is null or current_date <= p.end_date) then 0 else 1 end,
                    case when exists(
                            select 1 from promotion_users pru
                            where pru.promotion_id = p.promotion_id and pru.user_id = ?
                              and upper(coalesce(pru.user_promotion_status, 'ACTIVE')) = 'ACTIVE'
                              and pru.valid_from <= now()
                              and (pru.valid_until is null or pru.valid_until >= now())
                              and coalesce(pru.used_count, 0) < coalesce(pru.usage_limit, 1)
                    ) then 0 else 1 end,
                    case when p.end_date is null then 1 else 0 end,
                    p.end_date asc,
                    p.promotion_id desc
                """;
        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            PromotionAvailability availability = evaluateAvailability(
                    userId,
                    today,
                    rs.getInt("promotion_id"),
                    rs.getString("promotion_scope"),
                    rs.getString("status"),
                    toLocalDate(rs.getDate("start_date")),
                    toLocalDate(rs.getDate("end_date")),
                    (Integer) rs.getObject("usage_limit_total"),
                    rs.getInt("used_count_total"),
                    (Integer) rs.getObject("effective_usage_limit_per_user"),
                    rs.getInt("used_count_by_user"),
                    rs.getBoolean("assigned_to_user"),
                    rs.getBoolean("has_tier_rule"),
                    rs.getBoolean("allowed_by_tier")
            );

            return PublicPromotionResponse.builder()
                    .promotionId(rs.getInt("promotion_id"))
                    .promotionName(rs.getString("promotion_name"))
                    .promotionCode(rs.getString("promotion_code"))
                    .promotionScope(rs.getString("promotion_scope"))
                    .discountType(rs.getString("discount_type"))
                    .discountValue(rs.getBigDecimal("discount_value"))
                    .maxDiscount(rs.getBigDecimal("max_discount"))
                    .minOrderAmount(rs.getBigDecimal("min_order_amount"))
                    .startDate(toLocalDate(rs.getDate("start_date")))
                    .endDate(toLocalDate(rs.getDate("end_date")))
                    .promotionDescription(rs.getString("promotion_description"))
                    .status(rs.getString("status"))
                    .usageLimitTotal((Integer) rs.getObject("usage_limit_total"))
                    .usedCountTotal(rs.getInt("used_count_total"))
                    .usageLimitPerUser((Integer) rs.getObject("effective_usage_limit_per_user"))
                    .usedCountByCurrentUser(userId == null ? null : rs.getInt("used_count_by_user"))
                    .tierNames(rs.getString("tier_names"))
                    .homestayNames(rs.getString("homestay_names"))
                    .usable(availability.usable())
                    .unavailableReason(availability.reason())
                    .theme(THEMES.get(Math.floorMod(rs.getInt("promotion_id"), THEMES.size())))
                    .build();
        }, userId, userId, userId, userId, userId, userId);
    }

    private PromotionAvailability evaluateAvailability(
            Integer userId,
            LocalDate today,
            Integer promotionId,
            String scope,
            String status,
            LocalDate startDate,
            LocalDate endDate,
            Integer usageLimitTotal,
            int usedCountTotal,
            Integer usageLimitPerUser,
            int usedCountByUser,
            boolean assignedToUser,
            boolean hasTierRule,
            boolean allowedByTier
    ) {
        String normalizedStatus = status == null ? "ACTIVE" : status.trim().toUpperCase();
        String normalizedScope = scope == null ? "GLOBAL" : scope.trim().toUpperCase();

        if (!"ACTIVE".equals(normalizedStatus)) {
            return new PromotionAvailability(false, "M\u00e3 khuy\u1ebfn m\u00e3i \u0111ang t\u1ea1m ng\u01b0ng.");
        }
        if (startDate != null && today.isBefore(startDate)) {
            return new PromotionAvailability(false, "M\u00e3 khuy\u1ebfn m\u00e3i ch\u01b0a \u0111\u1ebfn ng\u00e0y \u00e1p d\u1ee5ng.");
        }
        if (endDate != null && today.isAfter(endDate)) {
            return new PromotionAvailability(false, "M\u00e3 khuy\u1ebfn m\u00e3i \u0111\u00e3 h\u1ebft h\u1ea1n.");
        }
        if (usageLimitTotal != null && usedCountTotal >= usageLimitTotal) {
            return new PromotionAvailability(false, "M\u00e3 khuy\u1ebfn m\u00e3i \u0111\u00e3 h\u1ebft l\u01b0\u1ee3t s\u1eed d\u1ee5ng.");
        }
        if (userId == null && requiresCurrentUser(normalizedScope, hasTierRule, usageLimitPerUser)) {
            return new PromotionAvailability(false, "\u0110\u0103ng nh\u1eadp \u0111\u1ec3 ki\u1ec3m tra \u0111i\u1ec1u ki\u1ec7n \u00e1p d\u1ee5ng.");
        }
        if (usageLimitPerUser != null && userId != null && usedCountByUser >= usageLimitPerUser) {
            return new PromotionAvailability(false, "B\u1ea1n \u0111\u00e3 s\u1eed d\u1ee5ng h\u1ebft l\u01b0\u1ee3t cho m\u00e3 n\u00e0y.");
        }
        if (("USER".equals(normalizedScope) || "HOMESTAY_USER".equals(normalizedScope)) && !assignedToUser) {
            return new PromotionAvailability(false, "M\u00e3 n\u00e0y kh\u00f4ng \u00e1p d\u1ee5ng cho t\u00e0i kho\u1ea3n c\u1ee7a b\u1ea1n.");
        }
        if ((hasTierRule || "TIER".equals(normalizedScope) || "HOMESTAY_TIER".equals(normalizedScope)) && !allowedByTier) {
            return new PromotionAvailability(false, "Mã hạng này chưa được mở khóa, đã hết lượt hoặc đã hết hạn.");
        }

        return new PromotionAvailability(true, "");
    }

    private boolean requiresCurrentUser(String scope, boolean hasTierRule, Integer usageLimitPerUser) {
        return hasTierRule
                || usageLimitPerUser != null
                || "USER".equals(scope)
                || "TIER".equals(scope)
                || "HOMESTAY_USER".equals(scope)
                || "HOMESTAY_TIER".equals(scope);
    }

    private Integer resolveUserId(String authorizationHeader) {
        String email = jwtUtil.extractEmailFromAuthorizationHeader(authorizationHeader);
        if (email == null || email.isBlank()) {
            return null;
        }
        return userRepository.findByEmail(email)
                .map(User::getUserId)
                .orElse(null);
    }

    private LocalDateTime toLocalDateTime(java.sql.Timestamp timestamp) {
        return timestamp == null ? null : timestamp.toLocalDateTime();
    }

    private LocalDate toLocalDate(Date date) {
        return date == null ? null : date.toLocalDate();
    }

    private record PromotionAvailability(boolean usable, String reason) {}
}
