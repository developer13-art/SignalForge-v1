/**
 * Role Route
 *
 * Guards routes that require the user to hold one of an allowed set
 * of roles. Renders a forbidden view when the check fails.
 *
 * @module client/src/routes/RoleRoute
 */

import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Lock } from 'lucide-react';

import { selectCurrentUser } from '../store/selectors/auth.selectors.js';

export default function RoleRoute({ allowed = [] }) {
  const user = useSelector(selectCurrentUser);

  const roles = user ? user.roles || [] : [];

  const allowedRoles = Array.isArray(allowed) ? allowed : [];

  const isSuperAdmin = roles.includes('SUPER_ADMIN');

  const permitted = isSuperAdmin || allowedRoles.some((role) => roles.includes(role));

  if (!permitted) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-6">
        <div className="max-w-md w-full rounded-2xl border border-error-border bg-error-subtle p-6 sm:p-8 text-center">
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

  return <Outlet />;
}