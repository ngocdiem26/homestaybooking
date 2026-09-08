import { apiRequest } from '../api/axiosClient';

function withQuery(endpoint, params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.set(key, value);
  });
  const suffix = query.toString() ? '?' + query.toString() : '';
  return endpoint + suffix;
}

export const maintenanceFeeService = {
  list: (params) => apiRequest(withQuery('/api/admin/maintenance-fees', params)),
  generate: (body) => apiRequest('/api/admin/maintenance-fees/generate', { method: 'POST', body }),
  markPaid: (id, body) => apiRequest('/api/admin/maintenance-fees/' + id + '/paid', { method: 'PATCH', body }),
  waive: (id, body) => apiRequest('/api/admin/maintenance-fees/' + id + '/waive', { method: 'PATCH', body }),
  markOverdue: () => apiRequest('/api/admin/maintenance-fees/mark-overdue', { method: 'PATCH' }),
  currentHostFee: () => apiRequest('/api/host/maintenance-fees/current'),
  hostHistory: (params) => apiRequest(withQuery('/api/host/maintenance-fees/history', params)),
  hostNotifications: () => apiRequest('/api/host/maintenance-fees/notifications'),
};

export const getMaintenanceFees = maintenanceFeeService.list;
export const generateMaintenanceFees = maintenanceFeeService.generate;
export const markMaintenancePaid = maintenanceFeeService.markPaid;
export const waiveMaintenanceFee = maintenanceFeeService.waive;
export const markMaintenanceOverdue = maintenanceFeeService.markOverdue;
