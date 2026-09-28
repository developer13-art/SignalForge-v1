/**
 * Authorization Middleware
 *
 * Generic authorization middleware factory. Requires an authenticated
 * user; optionally requires the user to have a specific role or
 * permission set.
 *
 * @module signalforge/server/middleware/authorization
 */

import { AuthorizationError } from '../lib/errors/authorization-error.js';

export function authorizationMiddleware(options = {}) {
  const { roles = [], permissions = [], requireAll = false } = options;

  return function authorize(req, res, next) {
    if (!req.user) {
      return next(
        new AuthorizationError('Authentication required', {
          code: 'AUTH_REQUIRED',
        }),
      );
    }

    const userRoles = new Set(req.user.roles || [req.user.role].filter(Boolean));
    const userPermissions = new Set(req.user.permissions || []);

    let authorized = true;

    if (roles.length > 0) {
      if (requireAll) {
        authorized = roles.every((role) => userRoles.has(role));
      } else {
        authorized = roles.some((role) => userRoles.has(role));
      }
    }

    if (authorized && permissions.length > 0) {
      if (requireAll) {
        authorized = permissions.every((perm) => userPermissions.has(perm));
      } else {
        authorized = permissions.some((perm) => userPermissions.has(perm));
      }
    }

    if (!authorized) {
      return next(
        new AuthorizationError('Insufficient permissions', {
          code: 'PERMISSION_DENIED',
        }),
      );
    }

    return next();
  };
}

export default authorizationMiddleware;