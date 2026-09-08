export function formatDate(value) {
  if (!value) {
    return '--';
  }

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