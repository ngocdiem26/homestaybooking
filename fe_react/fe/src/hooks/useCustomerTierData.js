import { useEffect, useMemo, useState } from 'react';
import { getMyTier, getMyTierOverview } from '../services/customerTierService';
import { getAuthSession } from '../services/authStorage';

const CACHE_PREFIX = 'cozygo_customer_tier:';

function resolveCacheKey(cacheKey) {
  if (cacheKey) return String(cacheKey);
  const user = getAuthSession().user || {};
  return String(user.userId || user.id || user.email || 'guest');
}

function readCachedTier(cacheKey) {
  const key = CACHE_PREFIX + resolveCacheKey(cacheKey);
  try {
    const raw = sessionStorage.getItem(key) || localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeCachedTier(cacheKey, tier) {
  if (!tier) return;
  const key = CACHE_PREFIX + resolveCacheKey(cacheKey);
  const value = JSON.stringify(tier);
  try { sessionStorage.setItem(key, value); } catch { /* cache is optional */ }
  try { localStorage.setItem(key, value); } catch { /* cache is optional */ }
}

export function useCustomerTierData(enabled = true, options = {}) {
  const cacheKey = useMemo(() => resolveCacheKey(options.cacheKey), [options.cacheKey]);
  const initialTier = options.initialTier || null;
  const [tier, setTier] = useState(() => enabled ? (initialTier || readCachedTier(cacheKey)) : null);
  const [tiers, setTiers] = useState([]);
  const [isLoading, setIsLoading] = useState(Boolean(enabled && !tier));
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!enabled) {
      setTier(null);
      setTiers([]);
      setIsLoading(false);
      setErrorMessage('');
      return undefined;
    }

    const cachedTier = initialTier || readCachedTier(cacheKey);
    if (cachedTier) {
      setTier(cachedTier);
      setIsLoading(false);
    }

    let mounted = true;

    async function loadTierData() {
      try {
        setIsLoading(!cachedTier);
        setErrorMessage('');
        const [myTier, overview] = await Promise.all([getMyTier(), getMyTierOverview()]);
        if (!mounted) return;
        setTier(myTier);
        writeCachedTier(cacheKey, myTier);
        setTiers(Array.isArray(overview) ? overview : []);
      } catch (error) {
        if (!mounted) return;
        setErrorMessage(error.message || 'Không thể tải cấp bậc thành viên');
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadTierData();
    return () => {
      mounted = false;
    };
  }, [enabled, cacheKey]);

  if (!enabled) {
    return { tier: null, tiers: [], isLoading: false, errorMessage: '' };
  }

  return { tier, tiers, isLoading, errorMessage };
}
