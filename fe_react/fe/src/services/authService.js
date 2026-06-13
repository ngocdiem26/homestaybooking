import { apiRequest } from '../api/axiosClient';
import { AUTH_ENDPOINTS } from '../api/endpoints';

export function pingAuthApi() {
  return apiRequest(AUTH_ENDPOINTS.PING);
}

export function login(payload) {
  return apiRequest(AUTH_ENDPOINTS.LOGIN, {
    method: 'POST',
    body: payload,
  });
}

export function register(payload) {
  return apiRequest(AUTH_ENDPOINTS.REGISTER, {
    method: 'POST',
    body: payload,
  });
}
