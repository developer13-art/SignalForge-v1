/**
 * Role Middleware
 *
 * Requires the authenticated user to have one or more roles.
 *
 * @module signalforge/server/middleware/role
 */

import { AuthorizationError } from '../lib/errors/authorization-error.js';

export function roleMiddleware(requiredRoles, options = {}) {
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  const requireAll = options.requireAll === true;

  return function checkRole(req, res, next) {
    if (!req.user) {
      return next(
        new AuthorizationError('Authentication required', {
          code: 'AUTH_REQUIRED',
        }),
      );
    }

    const userRoles = new Set(req.user.roles || [req.user.role].filter(Boolean));

    const authorized = requireAll
      ? roles.every((role) => userRoles.has(role))
      : roles.some((role) => userRoles.has(role));

    if (!authorized) {
      return next(
        new AuthorizationError('Insufficient role', {
          code: 'ROLE_DENIED',
          details: { required: roles },
        }),
      );
    }

    return next();
  };
}

export default roleMiddleware;