import { apiRequest } from '../api/axiosClient';
import { mapPublicHomestay } from './homestayService';

export async function getFavoriteHomestays() {
  const data = await apiRequest('/api/favorites');
  return data.map(mapPublicHomestay);
}

export async function getFavoriteIds() {
  return apiRequest('/api/favorites/ids');
}

export async function getFavoriteRecommendations() {
  const data = await apiRequest('/api/favorites/recommendations');
  return data.map(mapPublicHomestay);
}

export function addFavorite(homeId) {
  return apiRequest('/api/favorites/' + encodeURIComponent(homeId), {
    method: 'POST',
  });
}

export function removeFavorite(homeId) {
  return apiRequest('/api/favorites/' + encodeURIComponent(homeId), {
    method: 'DELETE',
  });
}
