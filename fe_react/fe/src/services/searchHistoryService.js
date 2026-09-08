import { apiRequest } from '../api/axiosClient';
import { CUSTOMER_SEARCH_HISTORY_ENDPOINTS } from '../api/endpoints';
import { getAuthToken } from './authStorage';

const SEARCH_HISTORY_KEY = 'homestay_search_history';
const MAX_HISTORY_ITEMS = 8;

function normalizeText(value) {
  return String(value || '').trim();
}

function mapServerHistory(data) {
  if (!Array.isArray(data)) return [];

  return data
    .map((item) => (typeof item === 'string' ? item : item?.keyword))
    .filter((item) => typeof item === 'string' && item.trim())
    .slice(0, MAX_HISTORY_ITEMS);
}

function rememberSessionHistory(history) {
  localStorage.removeItem(SEARCH_HISTORY_KEY);
  sessionStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
  return history;
}

export function getStoredSearchHistory() {
  try {
    localStorage.removeItem(SEARCH_HISTORY_KEY);
    const raw = sessionStorage.getItem(SEARCH_HISTORY_KEY);
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

  rememberSessionHistory(nextHistory);

  return nextHistory;
}

export function removeDestinationFromHistory(destination) {
  const normalizedDestination = normalizeText(destination);

  const nextHistory = getStoredSearchHistory().filter(
    (item) => item.toLowerCase() !== normalizedDestination.toLowerCase()
  );

  rememberSessionHistory(nextHistory);

  return nextHistory;
}

export function clearSearchHistory() {
  localStorage.removeItem(SEARCH_HISTORY_KEY);
  sessionStorage.removeItem(SEARCH_HISTORY_KEY);
  return [];
}

export async function loadAccountSearchHistory() {
  if (!getAuthToken()) {
    return getStoredSearchHistory();
  }

  const data = await apiRequest(CUSTOMER_SEARCH_HISTORY_ENDPOINTS.LIST);
  return rememberSessionHistory(mapServerHistory(data));
}

export async function saveDestinationToAccountHistory(destination) {
  const normalizedDestination = normalizeText(destination);

  if (!normalizedDestination) {
    return getStoredSearchHistory();
  }

  const localHistory = saveDestinationToHistory(normalizedDestination);

  if (!getAuthToken()) {
    return localHistory;
  }

  const data = await apiRequest(CUSTOMER_SEARCH_HISTORY_ENDPOINTS.SAVE, {
    method: 'POST',
    body: { keyword: normalizedDestination },
  });
  return rememberSessionHistory(mapServerHistory(data));
}

export async function removeDestinationFromAccountHistory(destination) {
  const localHistory = removeDestinationFromHistory(destination);

  if (!getAuthToken()) {
    return localHistory;
  }

  const data = await apiRequest(CUSTOMER_SEARCH_HISTORY_ENDPOINTS.DELETE_BY_KEYWORD(destination), {
    method: 'DELETE',
  });
  return rememberSessionHistory(mapServerHistory(data));
}

export async function clearAccountSearchHistory() {
  clearSearchHistory();

  if (!getAuthToken()) {
    return [];
  }

  const data = await apiRequest(CUSTOMER_SEARCH_HISTORY_ENDPOINTS.CLEAR, {
    method: 'DELETE',
  });
  return rememberSessionHistory(mapServerHistory(data));
}
