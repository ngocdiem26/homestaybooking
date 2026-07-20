const AUTH_USER_KEY = 'auth_user';
const AUTH_TOKEN_KEY = 'auth_token';
const AUTH_REMEMBER_KEY = 'auth_remember';

function clearStorage(storage) {
  storage.removeItem(AUTH_TOKEN_KEY);
  storage.removeItem(AUTH_USER_KEY);
}

function readStorage(storage) {
  const rawUser = storage.getItem(AUTH_USER_KEY);
  const token = storage.getItem(AUTH_TOKEN_KEY);

  if (!token || !rawUser) {
    return { token: null, user: null };
  }

  try {
    return {
      token,
      user: JSON.parse(rawUser),
    };
  } catch {
    clearStorage(storage);
    return { token: null, user: null };
  }
}

export function saveAuthSession(authResponse, rememberMe = false) {
  clearAuthSession();

  const storage = rememberMe ? localStorage : sessionStorage;
  storage.setItem(AUTH_TOKEN_KEY, authResponse.token);
  storage.setItem(AUTH_USER_KEY, JSON.stringify(authResponse));

  if (rememberMe) {
    localStorage.setItem(AUTH_REMEMBER_KEY, 'true');
  }
}

export function getAuthSession() {
  const sessionAuth = readStorage(sessionStorage);

  if (sessionAuth.token && sessionAuth.user) {
    return sessionAuth;
  }

  if (localStorage.getItem(AUTH_REMEMBER_KEY) !== 'true') {
    clearStorage(localStorage);
    return { token: null, user: null };
  }

  return readStorage(localStorage);
}

export function getAuthToken() {
  return getAuthSession().token;
}

export function clearAuthSession() {
  clearStorage(sessionStorage);
  clearStorage(localStorage);
  localStorage.removeItem(AUTH_REMEMBER_KEY);
}

export function updateAuthUser(partialUser) {
  const session = getAuthSession();
  if (!session.token || !session.user) return null;

  const updatedUser = { ...session.user, ...partialUser };
  const targetStorage = sessionStorage.getItem(AUTH_TOKEN_KEY) ? sessionStorage : localStorage;
  targetStorage.setItem(AUTH_USER_KEY, JSON.stringify(updatedUser));
  return updatedUser;
}
