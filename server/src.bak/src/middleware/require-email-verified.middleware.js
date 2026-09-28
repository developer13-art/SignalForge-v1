/**
 * Require Email Verified Middleware
 *
 * Rejects the request unless the authenticated user has verified
 * their email address.
 *
 * @module signalforge/server/middleware/require-email-verified
 */
const { AuthorizationError } = require('../lib/errors/authorization-error.js');
function requireEmailVerifiedMiddleware() {
  return function requireEmailVerified(req, res, next) {
    if (!req.user) {
      return next(
        new AuthorizationError('Authentication required', {
          code: 'AUTH_REQUIRED',
        }),
      );
    }

    if (req.user.emailVerified !== true) {
      return next(
        new AuthorizationError('Email verification required', {
          code: 'EMAIL_NOT_VERIFIED',
        }),
      );
    }

    return next();
  };
}
module.exports = requireEmailVerifiedMiddleware;
module.exports.requireEmailVerifiedMiddleware = requireEmailVerifiedMiddleware;
