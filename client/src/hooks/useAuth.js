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
import { useSelector } from 'react-redux';
import { AuthContext } from '../context/AuthContext.jsx';
import {
  selectAuthUser,
  selectIsAuthenticated,
  selectAuthStatus,
  selectAuthError,
  selectAccessToken,
} from '../store/selectors/auth.selectors.js';

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const user = useSelector(selectAuthUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const status = useSelector(selectAuthStatus);
  const error = useSelector(selectAuthError);
  const accessToken = useSelector(selectAccessToken);

  const isLoading = status === 'loading' || status === 'authenticating';

  const isKycVerified = Boolean(user && user.kycStatus === 'VERIFIED');

  const hasRole = useCallback(
    (role) => {
      if (!user || !Array.isArray(user.roles)) {
        return false;
      }
      return user.roles.includes(role);
    },
    [user],
  );

  const hasAnyRole = useCallback(
    (roles) => {
      if (!user || !Array.isArray(user.roles) || !Array.isArray(roles)) {
        return false;
      }
      return roles.some((role) => user.roles.includes(role));
    },
    [user],
  );

  return {
    ...context,
    user,
    isAuthenticated,
    isLoading,
    isKycVerified,
    status,
    error,
    accessToken,
    hasRole,
    hasAnyRole,
  };
}

export default useAuth;