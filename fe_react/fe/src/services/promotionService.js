import { apiRequest } from '../api/axiosClient';
import { PUBLIC_PROMOTION_ENDPOINTS } from '../api/endpoints';

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function mapPublicPromotion(promotion = {}) {
  return {
    ...promotion,
    promotionId: promotion.promotionId,
    id: promotion.promotionId,
    promotionName: promotion.promotionName || promotion.name || '',
    promotionCode: promotion.promotionCode || promotion.code || '',
    promotionScope: promotion.promotionScope || 'GLOBAL',
    discountType: promotion.discountType || 'PERCENT',
    discountValue: toNumber(promotion.discountValue),
    maxDiscount: promotion.maxDiscount == null ? null : toNumber(promotion.maxDiscount),
    minOrderAmount: toNumber(promotion.minOrderAmount),
    usageLimitTotal: promotion.usageLimitTotal == null ? null : toNumber(promotion.usageLimitTotal),
    usedCountTotal: toNumber(promotion.usedCountTotal),
    usageLimitPerUser: promotion.usageLimitPerUser == null ? null : toNumber(promotion.usageLimitPerUser),
    usedCountByCurrentUser: promotion.usedCountByCurrentUser == null ? null : toNumber(promotion.usedCountByCurrentUser),
    usable: promotion.usable !== false,
    unavailableReason: promotion.unavailableReason || '',
    userValidUntil: promotion.userValidUntil || promotion.user_valid_until || null,
    theme: promotion.theme || 'FOREST',
  };
}

function promotionPriority(promotion) {
  const usableScore = promotion.usable !== false ? 0 : 1;
  const endDate = promotion.endDate ? new Date(String(promotion.endDate).slice(0, 10) + 'T00:00:00').getTime() : Number.MAX_SAFE_INTEGER;
  const discountValue = Number(promotion.discountValue || 0);
  return { usableScore, endDate: Number.isFinite(endDate) ? endDate : Number.MAX_SAFE_INTEGER, discountValue };
}

export function sortPromotionsForCustomer(promotions = []) {
  return [...promotions].sort((left, right) => {
    const a = promotionPriority(left);
    const b = promotionPriority(right);
    if (a.usableScore !== b.usableScore) return a.usableScore - b.usableScore;
    if (a.endDate !== b.endDate) return a.endDate - b.endDate;
    return b.discountValue - a.discountValue;
  });
}

export async function getPublicPromotions() {
  const data = await apiRequest(PUBLIC_PROMOTION_ENDPOINTS.LIST);
  return Array.isArray(data) ? sortPromotionsForCustomer(data.map(mapPublicPromotion)) : [];
}
