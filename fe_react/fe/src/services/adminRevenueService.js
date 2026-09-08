// import { apiRequest } from '../api/axiosClient';

// function withQuery(endpoint, params = {}) {
//   const query = new URLSearchParams();
//   Object.entries(params).forEach(([key, value]) => {
//     if (value !== undefined && value !== null && value !== '') query.set(key, value);
//   });
//   const suffix = query.toString() ? '?' + query.toString() : '';
//   return endpoint + suffix;
// }

// export const getAdminRevenueSummary = (params) => apiRequest(withQuery('/api/admin/revenue/summary', params));
// export const getAdminRevenueChart = (params) => apiRequest(withQuery('/api/admin/revenue/chart', params));
// export const getBookingCommissions = (params) => apiRequest(withQuery('/api/admin/revenue/commissions', params));
// export const getTopRevenueHosts = (params) => apiRequest(withQuery('/api/admin/revenue/top-hosts', params));
// export const getTopRevenueHomestays = (params) => apiRequest(withQuery('/api/admin/revenue/top-homestays', params));

// export const adminRevenueService = {
//   getSummary: getAdminRevenueSummary,
//   getChart: getAdminRevenueChart,
//   getCommissions: getBookingCommissions,
//   getTopHosts: getTopRevenueHosts,
//   getTopHomestays: getTopRevenueHomestays,
// };
import { apiRequest } from '../api/axiosClient';

function withQuery(endpoint, params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(
    ([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== ''
      ) {
        query.set(key, String(value));
      }
    },
  );

  const suffix = query.toString()
    ? `?${query.toString()}`
    : '';

  return `${endpoint}${suffix}`;
}

export const getAdminRevenueSummary = (
  params = {},
) =>
  apiRequest(
    withQuery(
      '/api/admin/revenue/summary',
      params,
    ),
  );

export const getAdminRevenueChart = (
  params = {},
) =>
  apiRequest(
    withQuery(
      '/api/admin/revenue/chart',
      params,
    ),
  );

export const getBookingCommissions = (
  params = {},
) =>
  apiRequest(
    withQuery(
      '/api/admin/revenue/commissions',
      params,
    ),
  );

export const getTopRevenueHosts = (
  params = {},
) =>
  apiRequest(
    withQuery(
      '/api/admin/revenue/top-hosts',
      params,
    ),
  );

export const getTopRevenueHomestays = (
  params = {},
) =>
  apiRequest(
    withQuery(
      '/api/admin/revenue/top-homestays',
      params,
    ),
  );

export const adminRevenueService = {
  getSummary: getAdminRevenueSummary,
  getChart: getAdminRevenueChart,
  getCommissions: getBookingCommissions,
  getTopHosts: getTopRevenueHosts,
  getTopHomestays:
    getTopRevenueHomestays,
};