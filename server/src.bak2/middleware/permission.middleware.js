/**
 * Permission Middleware
 *
 * Requires the authenticated user to have one or more permissions.
 *
 * @module signalforge/server/middleware/permission
 */
const { AuthorizationError } = require('../lib/errors/authorization-error.js');
function permissionMiddleware(requiredPermissions, options = {}) {
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
module.exports = permissionMiddleware;
module.exports.permissionMiddleware = permissionMiddleware;
