export const DATE_FILTER_OPTIONS = [
  { value: 'all', label: 'Mặc định' },
  { value: 'today', label: 'Hôm nay' },
  { value: '7days', label: '7 ngày gần đây' },
  { value: '30days', label: '30 ngày gần đây' },
  { value: '90days', label: '90 ngày gần đây' },
  { value: 'custom', label: 'Chọn ngày' },
];

function startOfDay(date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfDay(date) {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

export function parseFilterDate(value) {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === 'number') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const text = String(value).trim();
  if (!text) return null;

  const viDateTime = text.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
  if (viDateTime) {
    const [, day, month, year, hour = '0', minute = '0', second = '0'] = viDateTime;
    const date = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second));
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const isoDate = /^\d{4}-\d{2}-\d{2}$/.test(text) ? `${text}T00:00:00` : text;
  const date = new Date(isoDate);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function isWithinDateFilter(value, filter = 'all', from = '', to = '', now = new Date()) {
  if (!filter || filter === 'all') return true;
  const date = parseFilterDate(value);
  if (!date) return false;

  if (filter === 'today') {
    return date >= startOfDay(now) && date <= endOfDay(now);
  }

  if (filter === 'custom') {
    const fromDate = parseFilterDate(from);
    const toDate = parseFilterDate(to);
    if (fromDate && date < startOfDay(fromDate)) return false;
    if (toDate && date > endOfDay(toDate)) return false;
    return true;
  }

  const days = Number(String(filter).replace('days', ''));
  if (Number.isFinite(days) && days > 0) {
    const fromDate = startOfDay(now);
    fromDate.setDate(fromDate.getDate() - days + 1);
    return date >= fromDate && date <= endOfDay(now);
  }

  return true;
}

export function pickDateValue(item, keys = []) {
  for (const key of keys) {
    const value = item?.[key];
    if (value) return value;
  }
  return null;
}

