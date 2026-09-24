/**
 * Auth Context
 *
 * Owns authentication state: the current user, access token, refresh
 * flow, and login/logout actions. Persists the access token in
 * localStorage so the session survives page reloads. Also listens for
 * forced-logout events (e.g. token revocation from another device).
 *
 * @module client/src/context/AuthContext
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

import { authApi } from '../api/auth.api.js';
import appConfig from '../config/app.config.js';

const AuthContext = createContext(null);

function readToken(key) {
  try {
    return localStorage.getItem(key) || null;
  } catch (err) {
    return null;
  }
}

function writeToken(key, value) {
  try {
    if (value === null || value === undefined) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, value);
    }
  } catch (err) {
    // ignore storage quota errors
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(() => readToken(appConfig.storage.accessTokenKey));
  const [refreshToken, setRefreshToken] = useState(() => readToken(appConfig.storage.refreshTokenKey));
  const [loading, setLoading] = useState(true);

  const clearSession = useCallback(() => {
    writeToken(appConfig.storage.accessTokenKey, null);
    writeToken(appConfig.storage.refreshTokenKey, null);
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
  }, []);

  const persistSession = useCallback((session) => {
    if (!session) {
      clearSession();
      return;
    }
    writeToken(appConfig.storage.accessTokenKey, session.accessToken);
    writeToken(appConfig.storage.refreshTokenKey, session.refreshToken);
    setAccessToken(session.accessToken);
    setRefreshToken(session.refreshToken);
    setUser(session.user || null);
  }, [clearSession]);

  const loadCurrentUser = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }
    try {
      const profile = await authApi.getCurrentUser();
      setUser(profile.user || profile);
    } catch (err) {
      clearSession();
    } finally {
      setLoading(false);
    }
  }, [accessToken, clearSession]);

  useEffect(() => {
    loadCurrentUser();
  }, [loadCurrentUser]);

  useEffect(() => {
    const handler = () => {
      clearSession();
      toast.error('Your session has been signed out.');
    };
    window.addEventListener('signalforge:auth:logout', handler);
    return () => window.removeEventListener('signalforge:auth:logout', handler);
  }, [clearSession]);

  const login = useCallback(
    async (credentials) => {
      const session = await authApi.login(credentials);
      persistSession(session);
      return session.user;
    },
    [persistSession],
  );

  const register = useCallback(
    async (payload) => {
      const session = await authApi.register(payload);
      if (session && session.accessToken) {
        persistSession(session);
      }
      return session;
    },
    [persistSession],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (err) {
      // ignore — we clear the session regardless
    } finally {
      clearSession();
      toast.success('Signed out');
    }
  }, [clearSession]);

  const refresh = useCallback(async () => {
    if (!refreshToken) {
      return null;
    }
    const session = await authApi.refresh({ refreshToken });
    persistSession(session);
    return session.user;
  }, [refreshToken, persistSession]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user && accessToken),
      isLoading: loading,
      accessToken,
      refreshToken,
      login,
      register,
      logout,
      refresh,
      setUser,
      clearSession,
    }),
    [user, accessToken, refreshToken, loading, login, register, logout, refresh, clearSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return ctx;
}

export { AuthContext };
export default AuthContext;