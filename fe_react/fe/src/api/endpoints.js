export const AUTH_ENDPOINTS = {
  PING: '/api/auth/ping',
  LOGIN: '/api/auth/login',
  GOOGLE_LOGIN: '/api/auth/google',
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
  TARGETS: '/api/admin/promotions/targets',
  DETAIL: (promotionId) => `/api/admin/promotions/${promotionId}`,
  STATUS: (promotionId) => `/api/admin/promotions/${promotionId}/status`,
};

export const HOST_HOMESTAY_ENDPOINTS = {
  LIST: '/api/host/homestays',
  DETAIL: (homeId) => `/api/host/homestays/${homeId}`,
  UPLOAD_IMAGE: '/api/host/homestays/images/upload',
};

export const HOST_AVAILABILITY_ENDPOINTS = {
  CALENDAR: '/api/host/availability',
};

export const PUBLIC_HOMESTAY_ENDPOINTS = {
  HOMESTAYS: '/api/public/homestays',
  HOMESTAY_DETAIL: (homeId) => '/api/public/homestays/' + homeId,
  HOMESTAY_AVAILABILITY: (homeId) => '/api/public/homestays/' + homeId + '/availability',
  DESTINATIONS: '/api/public/destinations',
};

export const PUBLIC_PROMOTION_ENDPOINTS = {
  LIST: '/api/public/promotions',
};


export const CHATBOT_ENDPOINTS = {
  MESSAGE: "/api/public/chatbot/message",
  HISTORY: "/api/public/chatbot/history",
};

export const ADMIN_CHATBOT_ENDPOINTS = {
  REINDEX: "/api/admin/chatbot/reindex",
  RAG_STATUS: "/api/admin/chatbot/rag-status",
};

export const CUSTOMER_TIER_ENDPOINTS = {
  ME: '/api/customer/tier/me',
  OVERVIEW: '/api/customer/tier/overview',
};

export const CUSTOMER_SEARCH_HISTORY_ENDPOINTS = {
  LIST: '/api/customer/search-history',
  SAVE: '/api/customer/search-history',
  DELETE_BY_KEYWORD: (keyword) => `/api/customer/search-history/keyword/${encodeURIComponent(keyword)}`,
  CLEAR: '/api/customer/search-history',
};

export const PROFILE_ENDPOINTS = {
  ME: '/api/profile/me',
  AVATAR: '/api/profile/me/avatar',
};
export const ITINERARY_ENDPOINTS = {
  AI_GENERATE: '/api/customer/itineraries/ai-generate',
  MY: '/api/customer/itineraries/my',
  DETAIL: (itineraryCode) => `/api/customer/itineraries/${encodeURIComponent(itineraryCode)}`,
  DELETE: (itineraryCode) => `/api/customer/itineraries/${encodeURIComponent(itineraryCode)}`,
  UPDATE: (itineraryCode) => `/api/customer/itineraries/${encodeURIComponent(itineraryCode)}`,
  ACTIVITY_SUGGEST: '/api/public/activities/suggest',
};

