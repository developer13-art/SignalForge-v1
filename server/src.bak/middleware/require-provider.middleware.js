/**
 * Require Provider Middleware
 *
 * Rejects the request unless the authenticated user has the PROVIDER
 * role or has an active provider profile.
 *
 * @module signalforge/server/middleware/require-provider
 */

import { AuthorizationError } from '../lib/errors/authorization-error.js';

export function requireProviderMiddleware() {
  return function requireProvider(req, res, next) {
    if (!req.user) {
      return next(
        new AuthorizationError('Authentication required', {
          code: 'AUTH_REQUIRED',
        }),
      );
    }

    const roles = req.user.roles || [req.user.role].filter(Boolean);
    if (!roles.includes('PROVIDER')) {
      return next(
        new AuthorizationError('Provider role required', {
          code: 'PROVIDER_ROLE_REQUIRED',
        }),
      );
    }

    return next();
  };
}

export default requireProviderMiddleware;