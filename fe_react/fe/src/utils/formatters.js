export function formatCurrency(value) {
  return new Intl.NumberFormat(
    'vi-VN',
    {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    },
  ).format(Number(value || 0));
}

export function formatDate(value) {
  if (!value) {
    return '--';
  }

  /*
   * Với LocalDate / LocalDateTime từ backend,
   * chỉ lấy phần YYYY-MM-DD.
   *
   * Không dùng new Date() để tránh browser
   * tự chuyển timezone làm lệch ngày.
   */
  if (typeof value === 'string') {
    const match = value.match(
      /^(\d{4})-(\d{2})-(\d{2})/,
    );

    if (match) {
      const [, year, month, day] =
        match;

      return `${day}/${month}/${year}`;
    }
  }

  /*
   * Fallback nếu value thực sự là Date,
   * timestamp hoặc định dạng khác.
   */
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '--';
  }

  return new Intl.DateTimeFormat(
    'vi-VN',
    {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone:
        'Asia/Ho_Chi_Minh',
    },
  ).format(date);
}