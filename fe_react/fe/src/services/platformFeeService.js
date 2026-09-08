import { apiRequest } from '../api/axiosClient';

export const platformFeeService = {
  getCurrent: () => apiRequest('/api/admin/platform-fees/current'),
  updateCurrent: (body) => apiRequest('/api/admin/platform-fees/current', { method: 'PUT', body }),
};

export const getCurrentPlatformFee = platformFeeService.getCurrent;
export const updatePlatformFee = platformFeeService.updateCurrent;
