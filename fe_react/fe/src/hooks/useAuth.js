import { getAuthSession } from '../services/authStorage';

export function useAuth() {
  return getAuthSession();
}
