/**
 * Require Active Account Middleware
 *
 * Rejects the request unless the authenticated user's account is in
 * the ACTIVE state. Used to gate sensitive operations.
 *
 * @module signalforge/server/middleware/require-active-account
 */

import { AuthorizationError } from '../lib/errors/authorization-error.js';
import { ACCOUNT_STATUSES } from '@signalforge/shared/constants/account-statuses';

export function requireActiveAccountMiddleware() {
  return function requireActiveAccount(req, res, next) {
    if (!req.user) {
      return next(
        new AuthorizationError('Authentication required', {
          code: 'AUTH_REQUIRED',
        }),
      );
    }

    if (req.user.accountStatus && req.user.accountStatus !== ACCOUNT_STATUSES.ACTIVE) {
      return next(
        new AuthorizationError('Account is not active', {
          code: 'ACCOUNT_NOT_ACTIVE',
          details: { status: req.user.accountStatus },
        }),
      );
    }

    return next();
  };
}

export default requireActiveAccountMiddleware;