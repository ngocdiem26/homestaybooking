export const HOMESTAY_STATUS_OPTIONS = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'PENDING', label: 'Chờ duyệt' },
  { value: 'APPROVED', label: 'Đã duyệt' },
  { value: 'REJECTED', label: 'Từ chối' },
  { value: 'BLOCKED', label: 'Bị chặn' },
];

export function getHomestayStatusLabel(status) {
  const statusOption = HOMESTAY_STATUS_OPTIONS.find((option) => option.value === status);
  return statusOption?.label || 'Không rõ';
}

export function getHomestayStatusClass(status) {
  if (status === 'APPROVED') {
    return 'bg-green-50 text-green-700 border-green-200/60';
  }

  if (status === 'PENDING') {
    return 'bg-amber-50 text-amber-700 border-amber-200/60';
  }

  return 'bg-red-50 text-red-600 border-red-200/60';
}

export function formatNightlyPrice(price) {
  const numericPrice = Number(price || 0);

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(numericPrice);
}

export function formatTime(time) {
  if (!time) {
    return 'Chưa cập nhật';
  }

  return time.slice(0, 5);
}
