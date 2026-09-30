/**
 * User Context
 *
 * Provides the richer user profile data used across the dashboard:
 * preferences, KYC state, subscription, wallet summary. Kept separate
 * from the auth context so auth actions do not trigger a profile
 * refetch every time.
 *
 * The context is intentionally null-safe: when the user is not
 * authenticated, or the profile request has not yet returned, every
 * downstream consumer receives explicit nulls and empty defaults
 * rather than undefined values.
 *
 * @module client/src/context/UserContext
 */

import { createContext, useContext, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { userApi } from '../api/user.api.js';
import { useAuth } from './AuthContext.jsx';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const { isAuthenticated, user: authUser } = useAuth();

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['user', 'profile'],
    queryFn: () => userApi.getProfile(),
    enabled: Boolean(isAuthenticated),
    staleTime: 60 * 1000,
    retry: 1,
  });

  const value = useMemo(() => {
    // The server returns { profile } — the profile is either a real
    // object or null. Never coerce the envelope itself into the profile.
    const profile = data && Object.prototype.hasOwnProperty.call(data, 'profile')
      ? data.profile
      : null;

    const kycStatus = profile?.kycStatus || authUser?.kycStatus || null;

    return {
      profile: profile ? { ...authUser, ...profile, kycStatus } : null,
      hasProfile: Boolean(profile),
      isLoading: Boolean(isAuthenticated) && (isLoading || isFetching),
      refresh: refetch,
      kycStatus,
      isKycVerified: String(kycStatus || '').toUpperCase() === 'VERIFIED',
      preferences: profile && profile.preferences ? profile.preferences : {},
      subscription: profile ? profile.subscription || null : null,
      wallet: profile ? profile.wallet || null : null,
    };
  }, [data, isLoading, isFetching, isAuthenticated, authUser, refetch]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUserContext() {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return ctx;
}

export { UserContext };
export default UserContext;   