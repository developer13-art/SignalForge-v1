/**
 * Require Provider Middleware
 *
 * Rejects the request unless the authenticated user has the PROVIDER
 * role or has an active provider profile.
 *
 * @module signalforge/server/middleware/require-provider
 */
const { AuthorizationError } = require('../lib/errors/authorization-error.js');
function requireProviderMiddleware() {
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
module.exports = requireProviderMiddleware;
module.exports.requireProviderMiddleware = requireProviderMiddleware;
