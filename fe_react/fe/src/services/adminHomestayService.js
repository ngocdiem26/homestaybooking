import { apiRequest } from '../api/axiosClient';
import { ADMIN_HOMESTAY_ENDPOINTS } from '../api/endpoints';

export function getAdminHomestays() {
  return apiRequest(ADMIN_HOMESTAY_ENDPOINTS.LIST);
}

export function updateAdminHomestayStatus(homeId, status) {
  return apiRequest(ADMIN_HOMESTAY_ENDPOINTS.STATUS(homeId), {
    method: 'PATCH',
    body: { status },
  });
}

export function deleteAdminHomestay(homeId) {
  return apiRequest(ADMIN_HOMESTAY_ENDPOINTS.DELETE(homeId), {
    method: 'DELETE',
  });
}
