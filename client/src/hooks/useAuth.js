/**
 * useAuth Hook
 *
 * Provides access to the authentication state and actions exposed by
 * the AuthContext. Also re-exports a set of convenience selectors so
 * components do not have to reach into the context shape manually.
 *
 * @module client/src/hooks/useAuth
 */

import { useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const { user, roles = [], isAuthenticated, isLoading, accessToken } = context;
  const status = isLoading ? 'loading' : isAuthenticated ? 'authenticated' : 'unauthenticated';
  const isKycVerified = String(user?.kycStatus || '').toUpperCase() === 'VERIFIED';

  const hasRole = useCallback(
    (role) => {
      if (!user) {
        return false;
      }
      return roles.includes(role) || user.roles?.includes(role) || user.role === role;
    },
    [user, roles],
  );

  const hasAnyRole = useCallback(
    (roles) => {
      if (!user || !Array.isArray(roles)) {
        return false;
      }
      const userRoles = context.roles || user.roles || [user.role].filter(Boolean);
      return roles.some((role) => userRoles.includes(role));
    },
    [user, context.roles],
  );

  return {
    ...context,
    user,
    isAuthenticated,
    isLoading,
    isKycVerified,
    status,
    error: null,
    accessToken,
    hasRole,
    hasAnyRole,
  };
}

export default useAuth;