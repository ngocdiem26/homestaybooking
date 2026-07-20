const SEARCH_HISTORY_KEY = 'homestay_search_history';
const MAX_HISTORY_ITEMS = 8;

function normalizeText(value) {
  return String(value || '').trim();
}

export function getStoredSearchHistory() {
  try {
    const raw = localStorage.getItem(SEARCH_HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];

    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item) => typeof item === 'string' && item.trim())
      .slice(0, MAX_HISTORY_ITEMS);
  } catch {
    return [];
  }
}

export function saveDestinationToHistory(destination) {
  const normalizedDestination = normalizeText(destination);

  if (!normalizedDestination) {
    return getStoredSearchHistory();
  }

  const currentHistory = getStoredSearchHistory();

  const nextHistory = [
    normalizedDestination,
    ...currentHistory.filter(
      (item) => item.toLowerCase() !== normalizedDestination.toLowerCase()
    ),
  ].slice(0, MAX_HISTORY_ITEMS);

  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(nextHistory));

  return nextHistory;
}

export function removeDestinationFromHistory(destination) {
  const normalizedDestination = normalizeText(destination);

  const nextHistory = getStoredSearchHistory().filter(
    (item) => item.toLowerCase() !== normalizedDestination.toLowerCase()
  );

  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(nextHistory));

  return nextHistory;
}

export function clearSearchHistory() {
  localStorage.removeItem(SEARCH_HISTORY_KEY);
  return [];
}