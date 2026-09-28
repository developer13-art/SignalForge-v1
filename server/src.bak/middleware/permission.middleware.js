/**
 * Permission Middleware
 *
 * Requires the authenticated user to have one or more permissions.
 *
 * @module signalforge/server/middleware/permission
 */

import { AuthorizationError } from '../lib/errors/authorization-error.js';

export function permissionMiddleware(requiredPermissions, options = {}) {
  const permissions = Array.isArray(requiredPermissions)
    ? requiredPermissions
    : [requiredPermissions];
  const requireAll = options.requireAll === true;

  return function checkPermission(req, res, next) {
    if (!req.user) {
      return next(
        new AuthorizationError('Authentication required', {
          code: 'AUTH_REQUIRED',
        }),
      );
    }

    const userPermissions = new Set(req.user.permissions || []);

    const authorized = requireAll
      ? permissions.every((perm) => userPermissions.has(perm))
      : permissions.some((perm) => userPermissions.has(perm));

    if (!authorized) {
      return next(
        new AuthorizationError('Insufficient permissions', {
          code: 'PERMISSION_DENIED',
          details: { required: permissions },
        }),
      );
    }

    return next();
  };
}

export default permissionMiddleware;