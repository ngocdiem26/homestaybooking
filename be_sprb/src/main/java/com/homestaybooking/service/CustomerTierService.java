package com.homestaybooking.service;

import com.homestaybooking.dto.response.CustomerTierResponse;
import com.homestaybooking.dto.response.TierBenefitResponse;
import com.homestaybooking.dto.response.TierPromotionResponse;
import com.homestaybooking.entity.User;
import com.homestaybooking.exception.AppException;
import com.homestaybooking.repository.UserRepository;
import com.homestaybooking.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerTierService {

    private static final String ACTIVE = "ACTIVE";
    private static final String BRONZE = "BRONZE";

    private final JdbcTemplate jdbcTemplate;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    @Transactional
    public CustomerTierResponse getMyTier(String authorizationHeader) {
        User user = getCurrentUser(authorizationHeader);
        return recalculateTier(user.getUserId());
    }

    @Transactional
    public List<TierBenefitResponse> getMyTierOverview(String authorizationHeader) {
        CustomerTierResponse account = getMyTier(authorizationHeader);
        List<TierRow> tiers = getActiveTiers();
        return tiers.stream()
                .map(tier -> toBenefitResponse(tier, account))
                .toList();
    }

    @Transactional
    public CustomerTierResponse recalculateTier(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException("Không tìm thấy tài khoản khách hàng"));
        int completedCount = countCompletedBookings24m(userId);
        TierRow resolvedTier = resolveTierByCompletedBookings(completedCount);
        TierAccountRow currentAccount = getTierAccount(userId);
        boolean tierChanged = currentAccount == null || !resolvedTier.tierId().equals(currentAccount.currentTierId());

        if (currentAccount == null) {
            jdbcTemplate.update(
                    "insert into customer_tier_accounts (user_id, current_tier_id, completed_bookings_24m, tier_started_at, last_calculated_at, created_at, updated_at) values (?, ?, ?, now(), now(), now(), now())",
                    userId,
                    resolvedTier.tierId(),
                    completedCount
            );
        } else {
            jdbcTemplate.update(
                    "update customer_tier_accounts set current_tier_id = ?, completed_bookings_24m = ?, tier_started_at = case when ? then now() else tier_started_at end, last_calculated_at = now(), updated_at = now() where user_id = ?",
                    resolvedTier.tierId(),
                    completedCount,
                    tierChanged,
                    userId
            );
        }

        TierAccountRow updatedAccount = getTierAccount(userId);
        ensureTierPromotionGrants(userId, resolvedTier.tierId(), updatedAccount == null ? LocalDateTime.now() : updatedAccount.tierStartedAt());
        TierRow nextTier = findNextTier(completedCount);
        return toCustomerTierResponse(user, resolvedTier, nextTier, completedCount, updatedAccount);
    }

    public int countCompletedBookings24m(Integer userId) {
        Integer count = jdbcTemplate.queryForObject(
                "select count(distinct b.booking_id) "
                        + "from bookings b "
                        + "join users u on u.user_id = b.user_id "
                        + "left join booking_details bd on bd.booking_id = b.booking_id "
                        + "where b.user_id = ? "
                        + "and coalesce(b.created_at, current_timestamp) >= coalesce(u.created_at, '1970-01-01 00:00:00') "
                        + "and upper(coalesce(b.booking_status, '')) not in ('CANCELLED','CANCELED','EXPIRED','NO_SHOW','REJECTED','DELETED') "
                        + "and (upper(coalesce(b.booking_status, '')) in ('COMPLETED','DONE','FINISHED') "
                        + "or ((upper(coalesce(b.payment_status, '')) in ('PAID','SUCCESS','COMPLETED','DA_THANH_TOAN') "
                        + "or exists (select 1 from payments p where p.booking_id = b.booking_id and upper(coalesce(p.payment_status, '')) in ('PAID','SUCCESS','COMPLETED','DA_THANH_TOAN'))) "
                        + "and bd.checkin_date is not null "
                        + "and bd.checkin_date < current_date))",
                Integer.class,
                userId
        );
        return count == null ? 0 : count;
    }

    public TierRow resolveTierByCompletedBookings(Integer completedCount) {
        List<TierRow> tiers = getActiveTiers();
        if (tiers.isEmpty()) {
            throw new AppException("Chưa cấu hinh cấp bậc thành viên nào trong hệ thống");
        }
        return tiers.stream()
                .filter(tier -> tier.minCompletedBookings24m() <= completedCount)
                .max(Comparator.comparingInt(TierRow::minCompletedBookings24m))
                .orElseGet(() -> tiers.stream()
                        .filter(tier -> BRONZE.equalsIgnoreCase(tier.tierCode()))
                        .findFirst()
                        .orElse(tiers.get(0)));
    }

    private TierBenefitResponse toBenefitResponse(TierRow tier, CustomerTierResponse account) {
        int completed = account.getCompletedBookings24m() == null ? 0 : account.getCompletedBookings24m();
        int required = tier.minCompletedBookings24m() == null ? 0 : tier.minCompletedBookings24m();
        boolean unlocked = completed >= required;
        boolean current = tier.tierId().equals(account.getCurrentTierId());
        return TierBenefitResponse.builder()
                .tierId(tier.tierId())
                .tierCode(tier.tierCode())
                .tierName(tier.tierName())
                .minCompletedBookings24m(required)
                .displayOrder(tier.displayOrder())
                .unlocked(unlocked)
                .current(current)
                .completedBookings24m(completed)
                .remainingBookings(Math.max(0, required - completed))
                .progressPercent(calculateProgress(completed, required))
                .promotions(getTierPromotions(tier.tierId(), account.getUserId()))
                .build();
    }

    private CustomerTierResponse toCustomerTierResponse(User user, TierRow currentTier, TierRow nextTier, int completedCount, TierAccountRow account) {
        return CustomerTierResponse.builder()
                .userId(user.getUserId())
                .fullName(user.getFullName())
                .avatarUrl(user.getAvatar())
                .currentTierId(currentTier.tierId())
                .currentTierCode(currentTier.tierCode())
                .currentTierName(currentTier.tierName())
                .completedBookings24m(completedCount)
                .currentTierMinBookings(currentTier.minCompletedBookings24m())
                .nextTierId(nextTier == null ? null : nextTier.tierId())
                .nextTierCode(nextTier == null ? null : nextTier.tierCode())
                .nextTierName(nextTier == null ? null : nextTier.tierName())
                .nextTierMinBookings(nextTier == null ? null : nextTier.minCompletedBookings24m())
                .remainingBookingsToNextTier(nextTier == null ? 0 : Math.max(0, nextTier.minCompletedBookings24m() - completedCount))
                .progressPercent(nextTier == null ? 100 : calculateRangeProgress(completedCount, currentTier.minCompletedBookings24m(), nextTier.minCompletedBookings24m()))
                .tierStartedAt(account == null ? null : account.tierStartedAt())
                .lastCalculatedAt(account == null ? null : account.lastCalculatedAt())
                .build();
    }

    private List<TierRow> getActiveTiers() {
        return jdbcTemplate.query(
                "select tier_id, tier_code, tier_name, min_completed_bookings_24m, display_order "
                        + "from loyalty_tiers "
                        + "where upper(coalesce(tier_status, 'ACTIVE')) = ? "
                        + "order by display_order asc, min_completed_bookings_24m asc",
                (rs, rowNum) -> new TierRow(
                        rs.getInt("tier_id"),
                        rs.getString("tier_code"),
                        rs.getString("tier_name"),
                        rs.getInt("min_completed_bookings_24m"),
                        rs.getInt("display_order")
                ),
                ACTIVE
        );
    }

    private TierRow findNextTier(int completedCount) {
        return getActiveTiers().stream()
                .filter(tier -> tier.minCompletedBookings24m() > completedCount)
                .min(Comparator.comparingInt(TierRow::minCompletedBookings24m))
                .orElse(null);
    }

    private TierAccountRow getTierAccount(Integer userId) {
        try {
            return jdbcTemplate.queryForObject(
                    "select user_id, current_tier_id, completed_bookings_24m, tier_started_at, last_calculated_at from customer_tier_accounts where user_id = ?",
                    (rs, rowNum) -> new TierAccountRow(
                            rs.getInt("user_id"),
                            rs.getInt("current_tier_id"),
                            rs.getInt("completed_bookings_24m"),
                            toLocalDateTime(rs.getTimestamp("tier_started_at")),
                            toLocalDateTime(rs.getTimestamp("last_calculated_at"))
                    ),
                    userId
            );
        } catch (EmptyResultDataAccessException exception) {
            return null;
        }
    }

    @Transactional
    public void ensureTierPromotionGrants(Integer userId) {
        if (userId == null) {
            return;
        }
        expireUserPromotionGrants(userId);
        TierAccountRow account = getTierAccount(userId);
        if (account == null) {
            recalculateTier(userId);
            return;
        }
        if (account.currentTierId() == null) {
            return;
        }
        ensureTierPromotionGrants(userId, account.currentTierId(), account.tierStartedAt());
    }

    private void ensureTierPromotionGrants(Integer userId, Integer currentTierId, LocalDateTime unlockedAt) {
        if (userId == null || currentTierId == null) {
            return;
        }
        LocalDateTime grantTime = unlockedAt == null ? LocalDateTime.now() : unlockedAt;
        jdbcTemplate.update(
                "insert ignore into promotion_users "
                        + "(promotion_id, user_id, granted_at, valid_from, valid_until, user_promotion_status, granted_reason, granted_tier_id, usage_limit, used_count) "
                        + "select p.promotion_id, ?, ?, ?, timestampadd(day, coalesce(pt.validity_days, 30), ?), "
                        + "'ACTIVE', 'TIER_UPGRADE', pt.tier_id, coalesce(nullif(p.usage_limit_per_user, 0), 1), 0 "
                        + "from promotions p "
                        + "join promotion_tiers pt on pt.promotion_id = p.promotion_id "
                        + "join loyalty_tiers promo_tier on promo_tier.tier_id = pt.tier_id "
                        + "join loyalty_tiers current_tier on current_tier.tier_id = ? "
                        + "where upper(coalesce(p.status, 'ACTIVE')) = 'ACTIVE' "
                        + "and upper(coalesce(p.promotion_scope, 'GLOBAL')) in ('TIER', 'HOMESTAY_TIER') "
                        + "and coalesce(promo_tier.min_completed_bookings_24m, 0) <= coalesce(current_tier.min_completed_bookings_24m, 0)",
                userId,
                Timestamp.valueOf(grantTime),
                Timestamp.valueOf(grantTime),
                Timestamp.valueOf(grantTime),
                currentTierId
        );
        refreshTierPromotionGrantWindows(userId, currentTierId, grantTime);
        expireUserPromotionGrants(userId);
    }

    private void refreshTierPromotionGrantWindows(Integer userId, Integer currentTierId, LocalDateTime grantTime) {
        jdbcTemplate.update(
                "update promotion_users pu "
                        + "join promotions p on p.promotion_id = pu.promotion_id "
                        + "join promotion_tiers pt on pt.promotion_id = p.promotion_id "
                        + "join loyalty_tiers promo_tier on promo_tier.tier_id = pt.tier_id "
                        + "join loyalty_tiers current_tier on current_tier.tier_id = ? "
                        + "set pu.valid_from = coalesce(pu.valid_from, ?), "
                        + "pu.valid_until = coalesce(pu.valid_until, timestampadd(day, coalesce(pt.validity_days, 30), coalesce(pu.valid_from, ?))), "
                        + "pu.granted_reason = coalesce(pu.granted_reason, 'TIER_UPGRADE'), "
                        + "pu.granted_tier_id = coalesce(pu.granted_tier_id, pt.tier_id), "
                        + "pu.usage_limit = greatest(coalesce(pu.usage_limit, 1), coalesce(nullif(p.usage_limit_per_user, 0), 1)), "
                        + "pu.updated_at = current_timestamp "
                        + "where pu.user_id = ? "
                        + "and upper(coalesce(p.status, 'ACTIVE')) = 'ACTIVE' "
                        + "and upper(coalesce(p.promotion_scope, 'GLOBAL')) in ('TIER', 'HOMESTAY_TIER') "
                        + "and coalesce(promo_tier.min_completed_bookings_24m, 0) <= coalesce(current_tier.min_completed_bookings_24m, 0) "
                        + "and (pu.valid_until is null or pu.granted_reason is null or pu.granted_tier_id is null)",
                currentTierId,
                Timestamp.valueOf(grantTime),
                Timestamp.valueOf(grantTime),
                userId
        );
    }

    private void expireUserPromotionGrants(Integer userId) {
        jdbcTemplate.update(
                "update promotion_users set user_promotion_status = 'EXPIRED' "
                        + "where user_id = ? and upper(coalesce(user_promotion_status, 'ACTIVE')) = 'ACTIVE' "
                        + "and valid_until is not null and valid_until < now()",
                userId
        );
    }

    private List<TierPromotionResponse> getTierPromotions(Integer tierId, Integer userId) {
        try {
            return jdbcTemplate.query(
                    "select p.promotion_id, p.promotion_name, p.promotion_code, p.discount_type, p.discount_value, "
                            + "p.max_discount, p.min_order_amount, p.start_date, p.end_date, p.status, "
                            + "pu.valid_from as user_valid_from, pu.valid_until as user_valid_until, "
                            + "pu.user_promotion_status, pu.usage_limit, pu.used_count, "
                            + "case when pu.promotion_id is not null and (upper(coalesce(pu.user_promotion_status, 'ACTIVE')) in ('USED_UP', 'EXPIRED', 'REVOKED') "
                            + "or coalesce(pu.used_count, 0) >= coalesce(pu.usage_limit, 1)) then true else false end as used_by_current_user "
                            + "from promotions p "
                            + "join promotion_tiers pt on pt.promotion_id = p.promotion_id "
                            + "left join promotion_users pu on pu.promotion_id = p.promotion_id and pu.user_id = ? "
                            + "where pt.tier_id = ? "
                            + "and upper(coalesce(p.status, 'ACTIVE')) = 'ACTIVE' "
                            + "and (p.start_date is null or current_date >= p.start_date) "
                            + "and (p.end_date is null or current_date <= p.end_date) "
                            + "order by case when pu.valid_until is null then 1 else 0 end, pu.valid_until asc, p.promotion_id desc",                    (rs, rowNum) -> TierPromotionResponse.builder()
                            .promotionId(rs.getInt("promotion_id"))
                            .promotionName(rs.getString("promotion_name"))
                            .promotionCode(rs.getString("promotion_code"))
                            .discountType(rs.getString("discount_type"))
                            .discountValue(rs.getBigDecimal("discount_value"))
                            .maxDiscount(rs.getBigDecimal("max_discount"))
                            .minOrderAmount(rs.getBigDecimal("min_order_amount"))
                            .startDate(toLocalDate(rs.getDate("start_date")))
                            .endDate(toLocalDate(rs.getDate("end_date")))
                            .status(rs.getString("status"))
                            .theme(null)
                            .usedByCurrentUser(rs.getBoolean("used_by_current_user"))
                            .userValidFrom(toLocalDateTime(rs.getTimestamp("user_valid_from")))
                            .userValidUntil(toLocalDateTime(rs.getTimestamp("user_valid_until")))
                            .userPromotionStatus(rs.getString("user_promotion_status"))
                            .usageLimit((Integer) rs.getObject("usage_limit"))
                            .usedCount((Integer) rs.getObject("used_count"))
                            .build(),
                    userId,
                    tierId
            );
        } catch (DataAccessException exception) {
            return List.of();
        }
    }

    private User getCurrentUser(String authorizationHeader) {
        String email = jwtUtil.extractEmailFromAuthorizationHeader(authorizationHeader);
        if (email == null || email.isBlank()) {
            throw new AppException("Vui lòng đăng nhập để xem cấp bậc thành viên");
        }
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException("Không tìm thấy tài khoản đăng nhập"));
    }

    private int calculateProgress(int completed, int required) {
        if (required <= 0) return 100;
        return Math.max(0, Math.min(100, (int) Math.floor((completed * 100.0) / required)));
    }

    private int calculateRangeProgress(int completed, int currentMin, int nextMin) {
        if (nextMin <= currentMin) return 100;
        int currentProgress = Math.max(0, completed - currentMin);
        int needed = nextMin - currentMin;
        return Math.max(0, Math.min(100, (int) Math.floor((currentProgress * 100.0) / needed)));
    }

    private LocalDateTime toLocalDateTime(Timestamp timestamp) {
        return timestamp == null ? null : timestamp.toLocalDateTime();
    }

    private LocalDate toLocalDate(java.sql.Date date) {
        return date == null ? null : date.toLocalDate();
    }

    public record TierRow(Integer tierId, String tierCode, String tierName, Integer minCompletedBookings24m, Integer displayOrder) {
    }

    private record TierAccountRow(Integer userId, Integer currentTierId, Integer completedBookings24m, LocalDateTime tierStartedAt, LocalDateTime lastCalculatedAt) {
    }
}
