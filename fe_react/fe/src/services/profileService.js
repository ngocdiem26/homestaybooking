import { apiRequest } from '../api/axiosClient';
import { PROFILE_ENDPOINTS } from '../api/endpoints';

export function getMyProfile() {
  return apiRequest(PROFILE_ENDPOINTS.ME);
}

export function updateMyAvatar(avatar) {
  return apiRequest(PROFILE_ENDPOINTS.AVATAR, {
    method: 'PUT',
    body: { avatar },
  });
}
