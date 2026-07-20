import { apiRequest } from '../api/axiosClient';

export function getHomestayReviews(homeId) {
  return apiRequest('/api/public/homestays/' + homeId + '/reviews');
}

export function getFeaturedReviews() {
  return apiRequest('/api/public/reviews/featured');
}

export function getReviewEligibility(homeId) {
  return apiRequest('/api/reviews/eligibility?homeId=' + encodeURIComponent(homeId));
}

export function createReview(payload) {
  return apiRequest('/api/reviews', { method: 'POST', body: payload });
}

export function getMyReviews() {
  return apiRequest('/api/reviews/me');
}

export function updateReview(reviewId, payload) {
  return apiRequest('/api/reviews/' + reviewId, { method: 'PUT', body: payload });
}

export function getAdminReviews(params = {}) {
  const query = new URLSearchParams();
  if (params.tab) query.set('tab', params.tab);
  return apiRequest('/api/admin/reviews' + (query.toString() ? '?' + query.toString() : ''));
}

export function getAdminReviewCounts() {
  return apiRequest('/api/admin/reviews/counts');
}

export function getAdminReviewDetail(reviewId) {
  return apiRequest('/api/admin/reviews/' + reviewId);
}

export function getAdminReviewLogs(reviewId) {
  return apiRequest('/api/admin/reviews/' + reviewId + '/logs');
}

export function updateAdminReviewStatus(reviewId, status) {
  return apiRequest('/api/admin/reviews/' + reviewId + '/status', { method: 'PATCH', body: { status } });
}

export function keepReviewVisible(reviewId, reason = '') {
  return apiRequest('/api/admin/reviews/' + reviewId + '/keep-visible', { method: 'PUT', body: { reason } });
}

export function hideReview(reviewId, reason = '') {
  return apiRequest('/api/admin/reviews/' + reviewId + '/hide', { method: 'PUT', body: { reason } });
}

export function rejectReview(reviewId, reason = '') {
  return apiRequest('/api/admin/reviews/' + reviewId + '/reject', { method: 'PUT', body: { reason } });
}

export function restoreReview(reviewId) {
  return apiRequest('/api/admin/reviews/' + reviewId + '/restore', { method: 'PUT' });
}

export function deleteAdminReview(reviewId) {
  return apiRequest('/api/admin/reviews/' + reviewId, { method: 'DELETE' });
}

export function getHostReviews() {
  return apiRequest('/api/host/reviews');
}

export function replyToHostReview(reviewId, content) {
  return apiRequest('/api/host/reviews/' + reviewId + '/reply', { method: 'POST', body: { content } });
}
