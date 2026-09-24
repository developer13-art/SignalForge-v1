/**
 * User Context
 *
 * Provides the richer user profile data used across the dashboard:
 * preferences, KYC state, subscription, wallet summary. Kept separate
 * from the auth context so auth actions do not trigger a profile
 * refetch every time.
 *
 * @module client/src/context/UserContext
 */

import { createContext, useContext, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { userApi } from '../api/user.api.js';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['user', 'profile'],
    queryFn: () => userApi.getProfile(),
    staleTime: 60 * 1000,
  });

  const value = useMemo(() => {
    const profile = data && data.user ? data.user : data || null;
    return {
      profile,
      isLoading,
      refresh: refetch,
      kycStatus: profile ? profile.kycStatus : null,
      isKycVerified: profile ? profile.kycStatus === 'VERIFIED' : false,
      preferences: profile ? profile.preferences || {} : {},
      subscription: profile ? profile.subscription || null : null,
      wallet: profile ? profile.wallet || null : null,
    };
  }, [data, isLoading, refetch]);

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