const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

function buildHeaders(customHeaders = {}) {
  const token = localStorage.getItem('auth_token');

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...customHeaders,
  };
}

async function parseResponse(response) {
  const contentType = response.headers.get('content-type');

  if (!contentType?.includes('application/json')) {
    return response.text();
  }

  return response.json();
}

export async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: buildHeaders(options.headers),
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await parseResponse(response);

  if (!response.ok) {
    const message = data?.message || data?.error || data || 'Request failed';
    throw new Error(message);
  }

  return data;
}
