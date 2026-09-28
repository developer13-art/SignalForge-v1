/**
 * RBAC Guards
 *
 * Middleware factories that verify roles and permissions using the
 * RBAC module's own services. These are complementary to the
 * platform-wide middleware in `src/middleware/`.
 *
 * @module signalforge/server/modules/rbac/guards
 */

import { AuthorizationError } from '../../lib/errors/authorization-error.js';
import { SYSTEM_PROTECTED_ROLES } from './rbac.constants.js';

export function requireRole(...roleNames) {
  return function roleGuard(req, res, next) {
    if (!req.user) {
      return next(new AuthorizationError('Authentication required', { code: 'AUTH_REQUIRED' }));
    }
    const userRoles = req.user.roles || [req.user.role].filter(Boolean);
    const hasRole = roleNames.some((name) => userRoles.includes(name));
    if (!hasRole) {
      return next(
        new AuthorizationError('Insufficient role', {
          code: 'ROLE_DENIED',
          details: { required: roleNames },
        }),
      );
    }
    return next();
  };
}

export function requireAnyAdminRole() {
  return requireRole(...SYSTEM_PROTECTED_ROLES);
}

export function requirePermission(...permissionNames) {
  return function permissionGuard(req, res, next) {
    if (!req.user) {
      return next(new AuthorizationError('Authentication required', { code: 'AUTH_REQUIRED' }));
    }
    const userPermissions = new Set(req.user.permissions || []);
    const hasPermission = permissionNames.some((name) => userPermissions.has(name));
    if (!hasPermission) {
      return next(
        new AuthorizationError('Insufficient permissions', {
          code: 'PERMISSION_DENIED',
          details: { required: permissionNames },
        }),
      );
    }
    return next();
  };
}

export function requireAllPermissions(...permissionNames) {
  return function permissionGuard(req, res, next) {
    if (!req.user) {
      return next(new AuthorizationError('Authentication required', { code: 'AUTH_REQUIRED' }));
    }
    const userPermissions = new Set(req.user.permissions || []);
    const hasAll = permissionNames.every((name) => userPermissions.has(name));
    if (!hasAll) {
      return next(
        new AuthorizationError('Insufficient permissions', {
          code: 'PERMISSION_DENIED',
          details: { required: permissionNames, requireAll: true },
        }),
      );
    }
    return next();
  };
}