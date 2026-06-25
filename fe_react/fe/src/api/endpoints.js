export const AUTH_ENDPOINTS = {
  PING: '/api/auth/ping',
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
};

export const ADMIN_USER_ENDPOINTS = {
  LIST: '/api/admin/users',
  STATUS: (userId) => `/api/admin/users/${userId}/status`,
  ROLE: (userId) => `/api/admin/users/${userId}/role`,
};

export const ADMIN_HOMESTAY_ENDPOINTS = {
  LIST: '/api/admin/homestays',
  STATUS: (homeId) => `/api/admin/homestays/${homeId}/status`,
  DELETE: (homeId) => `/api/admin/homestays/${homeId}`,
};

export const ADMIN_PROMOTION_ENDPOINTS = {
  LIST: '/api/admin/promotions',
  DETAIL: (promotionId) => `/api/admin/promotions/${promotionId}`,
  STATUS: (promotionId) => `/api/admin/promotions/${promotionId}/status`,
};

export const HOST_HOMESTAY_ENDPOINTS = {
  LIST: '/api/host/homestays',
  DETAIL: (homeId) => `/api/host/homestays/${homeId}`,
  UPLOAD_IMAGE: '/api/host/homestays/images/upload',
};
