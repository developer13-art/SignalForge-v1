/**
 * Require KYC Verified Middleware
 *
 * Rejects the request unless the authenticated user's KYC status is
 * VERIFIED. Returns HTTP 403 with a KYC_REQUIRED code so that the
 * frontend can display an in-context KYC prompt.
 *
 * @module signalforge/server/middleware/require-kyc-verified
 */

import { KYC_STATUSES } from '@signalforge/shared/constants/kyc-statuses';

import { AuthorizationError } from '../lib/errors/authorization-error.js';

export function requireKycVerifiedMiddleware() {
  return function requireKycVerified(req, res, next) {
    if (!req.user) {
      return next(
        new AuthorizationError('Authentication required', {
          code: 'AUTH_REQUIRED',
        }),
      );
    }

    if (req.user.kycStatus !== KYC_STATUSES.VERIFIED) {
      return next(
        new AuthorizationError('KYC verification required', {
          code: 'KYC_REQUIRED',
          statusCode: 403,
          details: {
            currentStatus: req.user.kycStatus || KYC_STATUSES.NOT_STARTED,
            requiredStatus: KYC_STATUSES.VERIFIED,
          },
        }),
      );
    }

    return next();
  };
}

export default requireKycVerifiedMiddleware;