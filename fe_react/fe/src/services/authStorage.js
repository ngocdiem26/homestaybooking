const AUTH_USER_KEY = 'auth_user';
const AUTH_TOKEN_KEY = 'auth_token';

export function saveAuthSession(authResponse) {
  localStorage.setItem(AUTH_TOKEN_KEY, authResponse.token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authResponse));
}

export function getAuthSession() {
  const rawUser = localStorage.getItem(AUTH_USER_KEY);

  return {
    token: localStorage.getItem(AUTH_TOKEN_KEY),
    user: rawUser ? JSON.parse(rawUser) : null,
  };
}

export function clearAuthSession() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}
