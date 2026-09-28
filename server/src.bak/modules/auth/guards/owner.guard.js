/**
 * Owner Guard
 *
 * Middleware factory that verifies the authenticated user owns the
 * resource identified by a route parameter. Administrators bypass
 * the ownership check.
 *
 * @module signalforge/server/modules/auth/guards/owner
 */

import { AuthorizationError } from '../../../lib/errors/authorization-error.js';

const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN'];

export function ownerGuard(paramName = 'userId', options = {}) {
  const {
    allowAdmin = true,
    resourceLoader = null,
  } = options;

  return async function ownerGuardMiddleware(req, res, next) {
    try {
      if (!req.user) {
        return next(
          new AuthorizationError('Authentication required', {
            code: 'AUTH_REQUIRED',
          }),
        );
      }

      const roles = req.user.roles || [req.user.role].filter(Boolean);
      if (allowAdmin && roles.some((role) => ADMIN_ROLES.includes(role))) {
        return next();
      }

      const resourceId = req.params[paramName] || req.body[paramName];

      if (!resourceId) {
        return next(
          new AuthorizationError('Resource identifier is required', {
            code: 'RESOURCE_ID_MISSING',
          }),
        );
      }

      if (resourceId !== req.user.id) {
        if (typeof resourceLoader === 'function') {
          const owner = await resourceLoader(resourceId);
          if (owner && owner.userId === req.user.id) {
            return next();
          }
        }
        return next(
          new AuthorizationError('You do not have access to this resource', {
            code: 'NOT_RESOURCE_OWNER',
          }),
        );
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
}

export default ownerGuard;