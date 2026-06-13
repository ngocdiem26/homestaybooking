export function getRoleLabel(role) {
  const labels = {
    ADMIN: 'Quản trị viên',
    CUSTOMER: 'Khách hàng',
    HOST: 'Chủ nhà',
  };

  return labels[role] || role || 'Chưa rõ';
}

export function getStatusLabel(status) {
  const labels = {
    ACTIVE: 'Đang hoạt động',
    BLOCKED: 'Bị khóa',
  };

  return labels[status] || status || 'Chưa rõ';
}

export function getGenderLabel(gender) {
  const labels = {
    male: 'Nam',
    female: 'Nữ',
    other: 'Khác',
    MALE: 'Nam',
    FEMALE: 'Nữ',
    OTHER: 'Khác',
  };

  return labels[gender] || gender || 'Chưa cập nhật';
}

export function getAvatarLabel(name) {
  return (name || '?').trim().charAt(0).toUpperCase();
}
