import { apiRequest } from '../api/axiosClient';
import { PUBLIC_HOMESTAY_ENDPOINTS } from '../api/endpoints';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

function normalizeBackendUrl(url) {
  if (!url) return '';
  const normalizedUrl = String(url);
  if (normalizedUrl.startsWith('http') || normalizedUrl.startsWith('data:') || normalizedUrl.startsWith('blob:')) return normalizedUrl;
  if (normalizedUrl.startsWith('/images/')) return normalizedUrl;
  return API_BASE_URL + normalizedUrl;
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toCurrencyText(value) {
  return toNumber(value).toLocaleString('vi-VN');
}

function buildQuery(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      if (value.length > 0) query.set(key, value.join(','));
      return;
    }
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, value);
    }
  });

  const queryString = query.toString();
  return queryString ? '?' + queryString : '';
}

export function mapPublicHomestay(apiHomestay = {}) {
  const pricePerNight = toNumber(apiHomestay.pricePerNight);
  const rating = toNumber(apiHomestay.rating ?? apiHomestay.ratingAvg);
  const reviewCount = toNumber(apiHomestay.reviewCount ?? apiHomestay.reviewsCount);
  const images = (apiHomestay.images || []).map((image, index) => ({
    imageId: image.imageId,
    url: normalizeBackendUrl(image.url || image.imageUrl),
    imageUrl: normalizeBackendUrl(image.imageUrl || image.url),
    isMain: Boolean(image.isMain) || index === 0,
    sortOrder: image.sortOrder ?? index + 1,
  }));
  const img = normalizeBackendUrl(apiHomestay.img || images[0]?.url);
  const amenities = apiHomestay.amenities || [];
  const services = apiHomestay.services || (apiHomestay.serviceItems || []).map((service) => service.serviceName || service.name).filter(Boolean);

  return {
    ...apiHomestay,
    id: apiHomestay.id || apiHomestay.homeId,
    homeId: apiHomestay.homeId || apiHomestay.id,
    name: apiHomestay.name || apiHomestay.homeName || '',
    address: apiHomestay.address || apiHomestay.homeAddress || '',
    city: apiHomestay.city || apiHomestay.province || apiHomestay.location || '',
    province: apiHomestay.province || apiHomestay.city || '',
    location: apiHomestay.location || apiHomestay.province || apiHomestay.city || '',
    description: apiHomestay.description || apiHomestay.homeDescription || '',
    pricePerNight,
    price: apiHomestay.price || toCurrencyText(pricePerNight),
    oldPrice: apiHomestay.oldPrice || toCurrencyText(Math.round(pricePerNight * 1.18)),
    rating,
    ratingAvg: rating,
    score: apiHomestay.score || rating.toFixed(1),
    reviewCount,
    reviewsCount: reviewCount,
    reviewText: apiHomestay.reviewText || (rating >= 4.8 ? 'Xuất sắc' : rating >= 4.5 ? 'Tuyệt vời' : 'Rất tốt'),
    orders: toNumber(apiHomestay.orders, reviewCount * 3),
    amenities,
    services,
    images,
    img,
    roomType: apiHomestay.roomType || 'Homestay riêng tư',
    details: apiHomestay.details || '',
    beds: apiHomestay.beds || '',
    distance: apiHomestay.distance || apiHomestay.province || '',
    alert: apiHomestay.alert || 'Có thể đặt cho chuyến đi sắp tới',
    tax: apiHomestay.tax || 'Đã bao gồm thuế và phí dịch vụ cơ bản',
  };
}

export function mapPublicDestination(apiDestination = {}) {
  return {
    destinationId: apiDestination.destinationId,
    provinceName: apiDestination.provinceName || '',
    displayName: apiDestination.displayName || apiDestination.provinceName || '',
    slug: apiDestination.slug || '',
    description: apiDestination.description || '',
    thumbnailUrl: normalizeBackendUrl(apiDestination.thumbnailUrl),
    displayOrder: apiDestination.displayOrder ?? 0,
    homestayCount: toNumber(apiDestination.homestayCount),
  };
}

export async function getPublicHomestays(filters = {}) {
  const endpoint = PUBLIC_HOMESTAY_ENDPOINTS.HOMESTAYS + buildQuery(filters);
  const data = await apiRequest(endpoint);
  return data.map(mapPublicHomestay);
}

export async function getPublicHomestay(homeId) {
  const data = await apiRequest(PUBLIC_HOMESTAY_ENDPOINTS.HOMESTAY_DETAIL(homeId));
  return mapPublicHomestay(data);
}

export async function getPublicDestinations() {
  const data = await apiRequest(PUBLIC_HOMESTAY_ENDPOINTS.DESTINATIONS);
  return data.map(mapPublicDestination);
}

