/**
 * Require Phone Verified Middleware
 *
 * Rejects the request unless the authenticated user has verified
 * their phone number.
 *
 * @module signalforge/server/middleware/require-phone-verified
 */
const { AuthorizationError } = require('../lib/errors/authorization-error.js');
function requirePhoneVerifiedMiddleware() {
  return function requirePhoneVerified(req, res, next) {
    if (!req.user) {
      return next(
        new AuthorizationError('Authentication required', {
          code: 'AUTH_REQUIRED',
        }),
      );
    }

    if (req.user.phoneVerified !== true) {
      return next(
        new AuthorizationError('Phone verification required', {
          code: 'PHONE_NOT_VERIFIED',
        }),
      );
    }

    return next();
  };
}
module.exports = requirePhoneVerifiedMiddleware;
module.exports.requirePhoneVerifiedMiddleware = requirePhoneVerifiedMiddleware;
