import { apiRequest } from '../api/axiosClient';
import { PROFILE_ENDPOINTS } from '../api/endpoints';

export function getMyProfile() {
  return apiRequest(PROFILE_ENDPOINTS.ME);
}

export function updateMyProfile(profile) {
  return apiRequest(PROFILE_ENDPOINTS.ME, {
    method: 'PUT',
    body: profile,
  });
}

export function updateMyAvatar(avatar) {
  return apiRequest(PROFILE_ENDPOINTS.AVATAR, {
    method: 'PUT',
    body: { avatar },
  });
}
