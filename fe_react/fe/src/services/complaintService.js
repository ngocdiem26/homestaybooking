import { apiRequest } from '../api/axiosClient';

export function getMyComplaints() {
  return apiRequest('/api/customer/complaints');
}

export function getMyComplaint(complaintId) {
  return apiRequest('/api/customer/complaints/' + complaintId);
}

export function createComplaint(payload) {
  return apiRequest('/api/customer/complaints', {
    method: 'POST',
    body: payload,
  });
}

export function getHostComplaints() {
  return apiRequest('/api/host/complaints');
}

export function getHostComplaint(complaintId) {
  return apiRequest('/api/host/complaints/' + complaintId);
}

export function getAdminComplaints() {
  return apiRequest('/api/admin/complaints');
}

export function getAdminComplaint(complaintId) {
  return apiRequest('/api/admin/complaints/' + complaintId);
}

export function resolveAdminComplaint(complaintId, payload) {
  return apiRequest('/api/admin/complaints/' + complaintId + '/resolve', {
    method: 'POST',
    body: payload,
  });
}

export function addComplaintMessage() {
  return Promise.reject(new Error('Chức năng phản hồi qua lại đã được thay bằng xử lý qua admin.'));
}

export function escalateComplaint() {
  return Promise.reject(new Error('Khiếu nại hiện được admin xử lý trực tiếp.'));
}

export function closeComplaint() {
  return Promise.reject(new Error('Khiếu nại chỉ được đóng sau khi admin xử lý.'));
}

