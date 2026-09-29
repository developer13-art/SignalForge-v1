/**
 * Role Route
 *
 * Guards routes that require the user to hold one of an allowed set
 * of roles. Reads authentication state from the auth context, which
 * is the single source of truth after login. Renders a forbidden
 * view when the check fails, or navigates the user to the console
 * their role is actually entitled to.
 *
 * @module client/src/routes/RoleRoute
 */

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Lock } from 'lucide-react';

import { useAuthContext } from '../context/AuthContext.jsx';
import { resolveHome } from '../lib/utils/resolveHome.js';

export default function RoleRoute({ allowed = [] }) {
  const location = useLocation();
  const { user, roles, isAuthenticated, isLoading } = useAuthContext();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const effectiveRoles = Array.isArray(roles) ? roles : [];

  const allowedRoles = Array.isArray(allowed) ? allowed : [];

  const isSuperAdmin = effectiveRoles.includes('SUPER_ADMIN');
  const permitted =
    allowedRoles.length === 0 ||
    isSuperAdmin ||
    allowedRoles.some((role) => effectiveRoles.includes(role));

  if (permitted) {
    return <Outlet />;
  }

  // The user is authenticated but not permitted here. Send them to
  // the console their role is entitled to, unless that would be the
  // same page — in which case render an explicit access-denied card
  // rather than looping.
  const fallback = resolveHome(user, effectiveRoles);

  if (fallback === location.pathname) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-6">
        <div className="w-full max-w-md rounded-2xl border border-error-border bg-error-subtle p-6 text-center sm:p-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-error/20 text-error">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-h4 font-semibold text-text-primary">Access denied</h2>
          <p className="mt-2 text-small text-text-secondary">
            Your account does not have permission to view this area.
          </p>
        </div>
      </div>
    );
  }

  return <Navigate to={fallback} replace />;
}