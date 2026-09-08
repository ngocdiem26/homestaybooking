import { ITINERARY_ENDPOINTS } from '../api/endpoints';
import { apiRequest } from '../api/axiosClient';

function buildQuery(params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    if (Array.isArray(value)) {
      const joined = value.filter(Boolean).join(',');
      if (joined) searchParams.set(key, joined);
      return;
    }
    searchParams.set(key, value);
  });

  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

const itineraryService = {
  suggestActivities(params) {
    return apiRequest(`${ITINERARY_ENDPOINTS.ACTIVITY_SUGGEST}${buildQuery(params)}`);
  },

  generate(payload) {
    return apiRequest(ITINERARY_ENDPOINTS.AI_GENERATE, {
      method: 'POST',
      body: payload,
    });
  },

  getMy() {
    return apiRequest(ITINERARY_ENDPOINTS.MY);
  },

  getDetail(itineraryCode) {
    return apiRequest(ITINERARY_ENDPOINTS.DETAIL(itineraryCode));
  },

  update(itineraryCode, payload) {
    return apiRequest(ITINERARY_ENDPOINTS.UPDATE(itineraryCode), {
      method: 'PUT',
      body: payload,
    });
  },

  delete(itineraryCode) {
    return apiRequest(ITINERARY_ENDPOINTS.DELETE(itineraryCode), {
      method: 'DELETE',
    });
  },
};

export default itineraryService;