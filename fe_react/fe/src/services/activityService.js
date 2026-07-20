import { apiRequest } from '../api/axiosClient';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

function normalizeBackendUrl(url) {
  if (!url) return '';
  const value = String(url);
  if (value.startsWith('http') || value.startsWith('data:') || value.startsWith('blob:')) return value;
  if (value.startsWith('/images/')) return value;
  return API_BASE_URL + value;
}

export function mapPublicActivity(activity = {}) {
  const images = (activity.images || []).map((image, index) => ({
    imageId: image.imageId || index + 1,
    imageUrl: normalizeBackendUrl(image.imageUrl || image.url),
    isThumbnail: Boolean(image.isThumbnail),
    displayOrder: image.displayOrder ?? index + 1,
  }));

  const thumbnailUrl = normalizeBackendUrl(activity.thumbnailUrl) || images[0]?.imageUrl || '';

  return {
    ...activity,
    id: activity.activityId,
    title: activity.activityName || '',
    province: activity.province || '',
    address: activity.activityAddress || '',
    shortDescription: activity.shortDescription || '',
    description: activity.description || activity.shortDescription || '',
    hotline: activity.hotline || '',
    thumbnailUrl,
    images: images.length ? images : (thumbnailUrl ? [{ imageId: 'thumb', imageUrl: thumbnailUrl, isThumbnail: true, displayOrder: 0 }] : []),
    badgeText: activity.badgeText || 'Trải nghiệm địa phương',
  };
}

export async function getPublicActivities() {
  const data = await apiRequest('/api/public/activities');
  return data.map(mapPublicActivity);
}
