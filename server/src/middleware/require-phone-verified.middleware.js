/**
 * Require Phone Verified Middleware
 *
 * Rejects the request unless the authenticated user has verified
 * their phone number.
 *
 * @module signalforge/server/middleware/require-phone-verified
 */

import { AuthorizationError } from '../lib/errors/authorization-error.js';

export function requirePhoneVerifiedMiddleware() {
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

export default requirePhoneVerifiedMiddleware;