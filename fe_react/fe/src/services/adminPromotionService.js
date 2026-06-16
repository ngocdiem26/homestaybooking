import { apiRequest } from '../api/axiosClient';
import { ADMIN_PROMOTION_ENDPOINTS } from '../api/endpoints';

export function getAdminPromotions() {
  return apiRequest(ADMIN_PROMOTION_ENDPOINTS.LIST);
}

export function createAdminPromotion(payload) {
  return apiRequest(ADMIN_PROMOTION_ENDPOINTS.LIST, {
    method: 'POST',
    body: payload,
  });
}

export function updateAdminPromotion(promotionId, payload) {
  return apiRequest(ADMIN_PROMOTION_ENDPOINTS.DETAIL(promotionId), {
    method: 'PUT',
    body: payload,
  });
}

export function updateAdminPromotionStatus(promotionId, status) {
  return apiRequest(ADMIN_PROMOTION_ENDPOINTS.STATUS(promotionId), {
    method: 'PATCH',
    body: { status },
  });
}

export function deleteAdminPromotion(promotionId) {
  return apiRequest(ADMIN_PROMOTION_ENDPOINTS.DETAIL(promotionId), {
    method: 'DELETE',
  });
}
