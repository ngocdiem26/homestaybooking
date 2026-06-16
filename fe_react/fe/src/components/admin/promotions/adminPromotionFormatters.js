export const PROMOTION_STATUS_OPTIONS = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'ACTIVE', label: 'Đang hoạt động' },
  { value: 'INACTIVE', label: 'Ngưng' },
];

export const DISCOUNT_TYPE_OPTIONS = [
  { value: 'PERCENT', label: 'Phần trăm (%)' },
  { value: 'AMOUNT', label: 'Cố định (VNĐ)' },
];

export function getPromotionStatusLabel(status) {
  return PROMOTION_STATUS_OPTIONS.find((option) => option.value === status)?.label || 'Không rõ';
}

export function getPromotionStatusClass(status) {
  return status === 'ACTIVE'
    ? 'bg-green-50 text-green-700 border-green-200/60'
    : 'bg-gray-100 text-gray-600 border-gray-200';
}

export function getDiscountTypeLabel(discountType) {
  return DISCOUNT_TYPE_OPTIONS.find((option) => option.value === discountType)?.label || 'Không rõ';
}

export function formatPromotionValue(promotion) {
  const value = Number(promotion.discountValue || 0);

  if (promotion.discountType === 'PERCENT') {
    return `${value}%`;
  }

  return formatCurrency(value);
}

export function formatCurrency(value) {
  if (value === null || value === undefined || value === '') {
    return 'Không giới hạn';
  }

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export function formatDateRange(startDate, endDate) {
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}

export function formatDate(date) {
  if (!date) {
    return 'Chưa cập nhật';
  }

  return new Intl.DateTimeFormat('vi-VN').format(new Date(`${date}T00:00:00`));
}
