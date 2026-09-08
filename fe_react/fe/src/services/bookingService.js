import { apiRequest } from '../api/axiosClient';

export function createBookingQuote(payload) {
  return apiRequest('/api/bookings/quote', {
    method: 'POST',
    body: payload,
  });
}

export function createBooking(payload) {
  return apiRequest('/api/bookings', {
    method: 'POST',
    body: payload,
  });
}

export function getBookingPaymentStatus(bookingId) {
  return apiRequest(`/api/bookings/${bookingId}/payment-status`);
}

export function getMyBookings() {
  return apiRequest('/api/bookings/me');
}


export function getMyPaymentTransactions() {
  return apiRequest('/api/bookings/me/transactions');
}
export function cancelMyBooking(bookingId) {
  return apiRequest(`/api/bookings/me/${bookingId}/cancel`, {
    method: 'PATCH',
  });
}

export function getHostBookings() {
  return apiRequest('/api/bookings/host');
}

export function updateHostBookingStatus(bookingId, status) {
  return apiRequest(`/api/bookings/host/${bookingId}/status`, {
    method: 'PATCH',
    body: { status },
  });
}

export function confirmHostBookingPayment(bookingId) {
  return apiRequest(`/api/bookings/host/${bookingId}/payment/confirm`, {
    method: 'PATCH',
  });
}


export function getAdminBookings() {
  return apiRequest('/api/bookings/admin');
}

export function updateAdminBookingStatus(bookingId, status) {
  return apiRequest('/api/bookings/admin/' + bookingId + '/status', {
    method: 'PATCH',
    body: { status },
  });
}

export function confirmAdminBookingPayment(bookingId) {
  return apiRequest('/api/bookings/admin/' + bookingId + '/payment/confirm', {
    method: 'PATCH',
  });
}


