import { apiRequest } from '../api/axiosClient';
import { ADMIN_USER_ENDPOINTS } from '../api/endpoints';

export function getAdminUsers() {
  return apiRequest(ADMIN_USER_ENDPOINTS.LIST);
}

export function updateAdminUserStatus(userId, userStatus) {
  return apiRequest(ADMIN_USER_ENDPOINTS.STATUS(userId), {
    method: 'PATCH',
    body: { userStatus },
  });
}

export function updateAdminUserRole(userId, roleName) {
  return apiRequest(ADMIN_USER_ENDPOINTS.ROLE(userId), {
    method: 'PATCH',
    body: { roleName },
  });
}
