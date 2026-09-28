/**
 * Require Trader Middleware
 *
 * Rejects the request unless the authenticated user has the TRADER
 * role or has an active trader profile.
 *
 * @module signalforge/server/middleware/require-trader
 */
const { AuthorizationError } = require('../lib/errors/authorization-error.js');
function requireTraderMiddleware() {
  return function requireTrader(req, res, next) {
    if (!req.user) {
      return next(
        new AuthorizationError('Authentication required', {
          code: 'AUTH_REQUIRED',
        }),
      );
    }

    const roles = req.user.roles || [req.user.role].filter(Boolean);
    if (!roles.includes('TRADER')) {
      return next(
        new AuthorizationError('Trader role required', {
          code: 'TRADER_ROLE_REQUIRED',
        }),
      );
    }

    return next();
  };
}
module.exports = requireTraderMiddleware;
module.exports.requireTraderMiddleware = requireTraderMiddleware;
