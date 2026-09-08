import { apiRequest } from '../api/axiosClient';

function withQuery(endpoint, params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.set(key, value);
  });
  const suffix = query.toString() ? '?' + query.toString() : '';
  return endpoint + suffix;
}

export function getHostRevenue(params = {}) {
  return apiRequest(withQuery('/api/host/revenue/summary', params));
}

export function getHostRevenueBookings(params = {}) {
  return apiRequest(withQuery('/api/host/revenue/bookings', params));
}

export function getCurrentHostMaintenanceFee() {
  return apiRequest('/api/host/maintenance-fees/current');
}

export function getHostMaintenanceHistory(params = {}) {
  return apiRequest(withQuery('/api/host/maintenance-fees/history', params));
}
