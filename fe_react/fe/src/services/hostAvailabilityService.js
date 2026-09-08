import { apiRequest } from '../api/axiosClient';
import { HOST_AVAILABILITY_ENDPOINTS } from '../api/endpoints';

function toQuery(params = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, value);
    }
  });
  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

export async function getHostAvailability(params) {
  return apiRequest(`${HOST_AVAILABILITY_ENDPOINTS.CALENDAR}${toQuery(params)}`);
}

export async function updateHostAvailability(payload) {
  return apiRequest(HOST_AVAILABILITY_ENDPOINTS.CALENDAR, {
    method: 'PATCH',
    body: payload,
  });
}
