import { createContext, useMemo, useState } from 'react';
import { clearAuthSession, getAuthSession, saveAuthSession } from '../services/authStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [authSession, setAuthSession] = useState(() => getAuthSession());

  const value = useMemo(() => ({
    ...authSession,
    isAuthenticated: Boolean(authSession.token && authSession.user),
    login(authResponse, rememberMe = false) {
      saveAuthSession(authResponse, rememberMe);
      setAuthSession(getAuthSession());
    },
    logout() {
      clearAuthSession();
      setAuthSession({ token: null, user: null });
    },
  }), [authSession]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
