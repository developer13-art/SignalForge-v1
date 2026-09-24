/**
 * Protected Route
 *
 * Guards routes that require an authenticated user. Redirects
 * unauthenticated visitors to the login page, preserving the
 * intended destination as a query parameter.
 *
 * @module client/src/routes/ProtectedRoute
 */

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { selectIsAuthenticated, selectAuthInitialized } from '../store/selectors/auth.selectors.js';
import LoadingState from '../components/common/LoadingState.jsx';

export default function ProtectedRoute({ redirectTo = '/login' }) {
  const location = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const initialized = useSelector(selectAuthInitialized);

  if (!initialized) {
    return <LoadingState message="Preparing session" />;
  }

  if (!isAuthenticated) {
    const search = new URLSearchParams({
      redirect: `${location.pathname}${location.search}`,
    });
    return <Navigate to={`${redirectTo}?${search.toString()}`} replace />;
  }

  return <Outlet />;
}