export function formatDate(value) {
  return new Intl.DateTimeFormat('vi-VN').format(new Date(value));
}
