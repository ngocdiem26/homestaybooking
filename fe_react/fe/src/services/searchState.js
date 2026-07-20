export const DEFAULT_SEARCH_STATE = {
  destination: '',
  checkIn: '',
  checkOut: '',
  guests: '',
};

const STORAGE_KEY = 'cozygo.searchState';
export const SEARCH_STATE_EVENT = 'cozygo:search-state';

function normalizeSearchState(search = {}) {
  return {
    destination: String(search.destination || ''),
    checkIn: String(search.checkIn || ''),
    checkOut: String(search.checkOut || ''),
    guests: search.guests === undefined || search.guests === null ? '' : String(search.guests),
  };
}

export function getStoredSearchState() {
  if (typeof window === 'undefined') return DEFAULT_SEARCH_STATE;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? normalizeSearchState(JSON.parse(raw)) : DEFAULT_SEARCH_STATE;
  } catch {
    return DEFAULT_SEARCH_STATE;
  }
}

export function saveSearchState(search = {}) {
  const nextSearch = normalizeSearchState({ ...getStoredSearchState(), ...search });

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSearch));
    window.dispatchEvent(new CustomEvent(SEARCH_STATE_EVENT, { detail: nextSearch }));
  }

  return nextSearch;
}

export function clearSearchState() {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(SEARCH_STATE_EVENT, { detail: DEFAULT_SEARCH_STATE }));
  }

  return DEFAULT_SEARCH_STATE;
}

export function buildSearchParams(search = {}) {
  const params = new URLSearchParams();
  const normalizedSearch = normalizeSearchState(search);

  Object.entries(normalizedSearch).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });

  return params;
}

export function calculateNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 1;

  const start = new Date(checkIn + 'T00:00:00');
  const end = new Date(checkOut + 'T00:00:00');
  const diff = Math.round((end.getTime() - start.getTime()) / 86400000);
  return Number.isFinite(diff) && diff > 0 ? diff : 1;
}
