export function normalizeText(value) {
  return String(value ?? '').trim();
}

export function isRequired(value) {
  return normalizeText(value).length > 0;
}

export function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalizeText(value));
}

export function isVietnamPhone(value) {
  const phone = normalizeText(value).replace(/\s+/g, '');
  return /^(0|\+84)(3|5|7|8|9)\d{8}$/.test(phone);
}

export function isStrongPassword(value) {
  const password = String(value ?? '');
  return password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);
}

export function isValidDate(value) {
  if (!value) return false;
  const date = new Date(value + 'T00:00:00');
  return !Number.isNaN(date.getTime());
}

export function isPastOrToday(value) {
  if (!isValidDate(value)) return false;
  const date = new Date(value + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date <= today;
}

export function isTodayOrFuture(value) {
  if (!isValidDate(value)) return false;
  const date = new Date(value + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date >= today;
}

export function isDateRangeValid(startDate, endDate) {
  if (!isValidDate(startDate) || !isValidDate(endDate)) return false;
  return new Date(endDate + 'T00:00:00') > new Date(startDate + 'T00:00:00');
}

export function isPositiveNumber(value) {
  return Number(value) > 0;
}

export function validateLoginForm(form) {
  const errors = {};
  if (!isRequired(form.email)) errors.email = 'Vui lòng nhập email.';
  else if (!isEmail(form.email)) errors.email = 'Email không đúng định dạng.';
  if (!isRequired(form.password)) errors.password = 'Vui lòng nhập mật khẩu.';
  return errors;
}

export function validateRegisterForm(form) {
  const errors = {};
  if (!isRequired(form.fullName)) errors.fullName = 'Vui lòng nhập họ tên.';
  else if (normalizeText(form.fullName).length < 2) errors.fullName = 'Họ tên cần ít nhất 2 ký tự.';

  if (!isRequired(form.email)) errors.email = 'Vui lòng nhập email.';
  else if (!isEmail(form.email)) errors.email = 'Email không đúng định dạng.';

  if (!isRequired(form.password)) errors.password = 'Vui lòng nhập mật khẩu.';
  else if (!isStrongPassword(form.password)) errors.password = 'Mật khẩu cần ít nhất 8 ký tự, gồm chữ và số.';

  if (!isRequired(form.confirmPassword)) errors.confirmPassword = 'Vui lòng nhập lại mật khẩu.';
  else if (form.confirmPassword !== form.password) errors.confirmPassword = 'Mật khẩu nhập lại không khớp.';

  if (!isRequired(form.phoneNumber)) errors.phoneNumber = 'Vui lòng nhập số điện thoại.';
  else if (!isVietnamPhone(form.phoneNumber)) errors.phoneNumber = 'Số điện thoại Việt Nam không hợp lệ.';

  if (!isRequired(form.dateOfBirth)) errors.dateOfBirth = 'Vui lòng chọn ngày sinh.';
  else if (!isPastOrToday(form.dateOfBirth)) errors.dateOfBirth = 'Ngày sinh không được ở tương lai.';

  if (!isRequired(form.gender)) errors.gender = 'Vui lòng chọn giới tính.';

  if (!isRequired(form.address)) errors.address = 'Vui lòng nhập địa chỉ thường trú.';
  else if (normalizeText(form.address).length < 5) errors.address = 'Địa chỉ cần ít nhất 5 ký tự.';

  return errors;
}

