import { apiRequest } from '../api/axiosClient';

export function getHostRevenue(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, value);
    }
  });

  const suffix = query.toString() ? '?' + query.toString() : '';
  return apiRequest('/api/host/revenue' + suffix);
}
