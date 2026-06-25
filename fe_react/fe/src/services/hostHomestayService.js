import { apiRequest } from '../api/axiosClient';
import { HOST_HOMESTAY_ENDPOINTS } from '../api/endpoints';
import { getAuthSession, getAuthToken } from './authStorage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

function normalizeBackendUrl(url) {
  if (!url) return '';
  if (String(url).startsWith('http')) return url;
  return API_BASE_URL + url;
}

function getCurrentOwnerId() {
  return getAuthSession().user?.userId || null;
}

function toUiStatus(status) {
  const normalized = String(status || '').toUpperCase();
  if (normalized === 'APPROVED') return 'Đang hoạt động';
  if (normalized === 'REJECTED') return 'Từ chối';
  if (normalized === 'BLOCKED') return 'Bị chặn';
  return 'Chờ duyệt';
}

function toApiServiceStatus(status) {
  if (status === 'Tạm ngưng' || status === 'Bị chặn') return 'BLOCKED';
  if (status === 'Chờ duyệt') return 'PENDING';
  if (status === 'Từ chối') return 'REJECTED';
  return 'APPROVED';
}

function toUiServiceStatus(status) {
  const normalized = String(status || '').toUpperCase();
  return normalized === 'BLOCKED' ? 'Tạm ngưng' : 'Đang hoạt động';
}

function normalizeTime(value, fallback) {
  if (!value) return fallback;
  return String(value).slice(0, 5);
}

function formatHomestayId(homeId) {
  return 'HMS-' + String(homeId || 0).padStart(3, '0');
}

export function mapApiHomestay(apiHomestay) {
  return {
    homeId: apiHomestay.homeId,
    id: formatHomestayId(apiHomestay.homeId),
    name: apiHomestay.homeName || '',
    city: apiHomestay.province || '',
    address: apiHomestay.homeAddress || '',
    description: apiHomestay.homeDescription || '',
    price: Number(apiHomestay.pricePerNight || 0),
    discount: Number(apiHomestay.discountPercent || 0),
    guests: Number(apiHomestay.maxGuest || 1),
    bedrooms: Number(apiHomestay.bedroomCount || 1),
    bathrooms: Number(apiHomestay.bathroomCount || 1),
    livingRoom: Number(apiHomestay.livingRoomCount || 0),
    kitchen: Number(apiHomestay.kitchenCount || 0),
    beds: Number(apiHomestay.bedCount || 1),
    checkinTime: normalizeTime(apiHomestay.checkinTime, '14:00'),
    checkoutTime: normalizeTime(apiHomestay.checkoutTime, '12:00'),
    ratingAvg: Number(apiHomestay.ratingAvg || 0),
    ratingCount: Number(apiHomestay.ratingCount || 0),
    status: toUiStatus(apiHomestay.status),
    createdAt: apiHomestay.createdAt ? String(apiHomestay.createdAt).slice(0, 10) : '',
    updatedAt: apiHomestay.updatedAt ? String(apiHomestay.updatedAt).slice(0, 10) : '',
    images: (apiHomestay.images || []).map((image, index) => ({
      imageId: image.imageId,
      url: normalizeBackendUrl(image.imageUrl),
      isMain: Boolean(image.isMain) || index === 0,
      sortOrder: image.sortOrder ?? index + 1,
    })),
    amenities: apiHomestay.amenities || [],
    services: (apiHomestay.services || []).map((service) => ({
      id: service.homestayServiceId || service.serviceId || Date.now(),
      homestayServiceId: service.homestayServiceId,
      serviceId: service.serviceId,
      name: service.serviceName || '',
      description: service.description || '',
      price: Number(service.price || 0),
      status: toUiServiceStatus(service.status),
    })),
    rules: apiHomestay.rules || [],
  };
}

export function mapUiHomestayToRequest(homestay, extraConfig = {}) {
  const ownerId = getCurrentOwnerId();
  const images = extraConfig.images ?? homestay.images ?? [];
  const amenities = extraConfig.amenities ?? homestay.amenities ?? [];
  const services = extraConfig.services ?? homestay.services ?? [];
  const rules = extraConfig.rules ?? homestay.rules ?? [];

  return {
    ownerId,
    homeName: homestay.name,
    homeAddress: homestay.address,
    province: homestay.city,
    homeDescription: homestay.description || '',
    pricePerNight: Number(homestay.price || 0),
    discountPercent: Number(homestay.discount || 0),
    maxGuest: Number(homestay.guests || 1),
    bedroomCount: Number(homestay.bedrooms || 1),
    bathroomCount: Number(homestay.bathrooms || 1),
    kitchenCount: Number(homestay.kitchen || 0),
    livingRoomCount: Number(homestay.livingRoom || 0),
    bedCount: Number(homestay.beds || 1),
    checkinTime: homestay.checkinTime || '14:00',
    checkoutTime: homestay.checkoutTime || '12:00',
    images: images
      .filter((image) => image?.url && !String(image.url).startsWith('blob:'))
      .map((image, index) => ({
        imageId: image.imageId,
        imageUrl: image.url,
        isMain: Boolean(image.isMain) || index === 0,
        sortOrder: image.sortOrder ?? index + 1,
      })),
    amenities,
    services: services.map((service) => ({
      homestayServiceId: service.homestayServiceId,
      serviceId: service.serviceId,
      serviceName: service.name,
      description: service.description || service.name,
      price: Number(service.price || 0),
      status: toApiServiceStatus(service.status),
    })),
    rules,
  };
}

export async function getHostHomestays() {
  const ownerId = getCurrentOwnerId();
  const endpoint = ownerId
    ? HOST_HOMESTAY_ENDPOINTS.LIST + '?ownerId=' + ownerId
    : HOST_HOMESTAY_ENDPOINTS.LIST;
  const data = await apiRequest(endpoint);
  return data.map(mapApiHomestay);
}

export async function createHostHomestay(homestay, extraConfig) {
  const data = await apiRequest(HOST_HOMESTAY_ENDPOINTS.LIST, {
    method: 'POST',
    body: mapUiHomestayToRequest(homestay, extraConfig),
  });
  return mapApiHomestay(data);
}

export async function updateHostHomestay(homeId, homestay, extraConfig) {
  const data = await apiRequest(HOST_HOMESTAY_ENDPOINTS.DETAIL(homeId), {
    method: 'PUT',
    body: mapUiHomestayToRequest(homestay, extraConfig),
  });
  return mapApiHomestay(data);
}

export async function deleteHostHomestay(homeId) {
  const ownerId = getCurrentOwnerId();
  const endpoint = ownerId
    ? HOST_HOMESTAY_ENDPOINTS.DETAIL(homeId) + '?ownerId=' + ownerId
    : HOST_HOMESTAY_ENDPOINTS.DETAIL(homeId);
  await apiRequest(endpoint, { method: 'DELETE' });
}

export async function uploadHostHomestayImages(files, currentLength = 0) {
  const validFiles = Array.from(files || []).filter((file) => file.type.startsWith('image/'));
  const token = getAuthToken();

  const uploadedImages = await Promise.all(
    validFiles.map(async (file, index) => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(API_BASE_URL + HOST_HOMESTAY_ENDPOINTS.UPLOAD_IMAGE, {
        method: 'POST',
        headers: token ? { Authorization: 'Bearer ' + token } : {},
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || data?.error || 'Không tải được ảnh homestay');
      }

      return {
        imageId: data.imageId,
        url: normalizeBackendUrl(data.imageUrl),
        isMain: currentLength === 0 && index === 0,
        sortOrder: currentLength + index + 1,
        fileName: file.name,
      };
    })
  );

  return uploadedImages;
}
