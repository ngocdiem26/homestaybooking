import { CUSTOMER_TIER_ENDPOINTS } from '../api/endpoints';
import { apiRequest } from '../api/axiosClient';

export function getMyTier() {
  return apiRequest(CUSTOMER_TIER_ENDPOINTS.ME);
}

export function getMyTierOverview() {
  return apiRequest(CUSTOMER_TIER_ENDPOINTS.OVERVIEW);
}
