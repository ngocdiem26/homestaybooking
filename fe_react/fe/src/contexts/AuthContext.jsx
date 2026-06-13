import { createContext } from 'react';
import { getAuthSession } from '../services/authStorage';

const AuthContext = createContext(getAuthSession());

export function AuthProvider({ children }) {
  return (
    <AuthContext.Provider value={getAuthSession()}>
      {children}
    </AuthContext.Provider>
  );
}
