/**
 * Require Admin Middleware
 *
 * Rejects the request unless the authenticated user has the ADMIN or
 * SUPER_ADMIN role.
 *
 * @module signalforge/server/middleware/require-admin
 */

import { AuthorizationError } from '../lib/errors/authorization-error.js';

const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN'];

export function requireAdminMiddleware() {
  return function requireAdmin(req, res, next) {
    if (!req.user) {
      return next(
        new AuthorizationError('Authentication required', {
          code: 'AUTH_REQUIRED',
        }),
      );
    }

    const roles = req.user.roles || [req.user.role].filter(Boolean);
    if (!roles.some((role) => ADMIN_ROLES.includes(role))) {
      return next(
        new AuthorizationError('Administrator role required', {
          code: 'ADMIN_ROLE_REQUIRED',
        }),
      );
    }

    return next();
  };
}

export default requireAdminMiddleware;