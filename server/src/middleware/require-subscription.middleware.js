/**
 * Require Subscription Middleware
 *
 * Rejects the request unless the authenticated user has an active or
 * trial subscription. Subscription state is resolved upstream by the
 * authentication flow or a subscription lookup.
 *
 * @module signalforge/server/middleware/require-subscription
 */

import { AuthorizationError } from '../lib/errors/authorization-error.js';

export function requireSubscriptionMiddleware(options = {}) {
  const allowedStatuses = options.statuses || ['TRIAL', 'ACTIVE'];

  return function requireSubscription(req, res, next) {
    if (!req.user) {
      return next(
        new AuthorizationError('Authentication required', {
          code: 'AUTH_REQUIRED',
        }),
      );
    }

    if (!req.user.subscriptionStatus || !allowedStatuses.includes(req.user.subscriptionStatus)) {
      return next(
        new AuthorizationError('Subscription required', {
          code: 'SUBSCRIPTION_REQUIRED',
          details: {
            currentStatus: req.user.subscriptionStatus || null,
            allowedStatuses,
          },
        }),
      );
    }

    return next();
  };
}

export default requireSubscriptionMiddleware;