import { apiRequest } from '../api/axiosClient';

export function getHomestayReviews(homeId) {
  return apiRequest(`/api/public/homestays/${homeId}/reviews`);
}

export function getFeaturedReviews() {
  return apiRequest('/api/public/reviews/featured');
}

export function getReviewEligibility(homeId) {
  return apiRequest(`/api/reviews/eligibility?homeId=${encodeURIComponent(homeId)}`);
}

export function createReview(payload) {
  return apiRequest('/api/reviews', {
    method: 'POST',
    body: payload,
  });
}

export function getAdminReviews() {
  return apiRequest('/api/admin/reviews');
}

export function updateAdminReviewStatus(reviewId, status) {
  return apiRequest(`/api/admin/reviews/${reviewId}/status`, {
    method: 'PATCH',
    body: { status },
  });
}

export function getHostReviews() {
  return apiRequest('/api/host/reviews');
}

export function getMyReviews() {
  return apiRequest('/api/reviews/me');
}

export function updateReview(reviewId, payload) {
  return apiRequest(`/api/reviews/${reviewId}`, {
    method: 'PUT',
    body: payload,
  });
}

export function replyToHostReview(reviewId, content) {
  return apiRequest(`/api/host/reviews/${reviewId}/reply`, {
    method: 'POST',
    body: { content },
  });
}

export function deleteAdminReview(reviewId) {
  return apiRequest(`/api/admin/reviews/${reviewId}`, {
    method: 'DELETE',
  });
}
