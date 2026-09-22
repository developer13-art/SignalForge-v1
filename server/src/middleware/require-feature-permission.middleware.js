/**
 * Require Feature Permission Middleware
 *
 * Checks the user's subscription and role-based feature permissions
 * before allowing access to a route. Combines KYC gating with
 * subscription status and plan capabilities.
 *
 * @module signalforge/server/middleware/require-feature-permission
 */

import { AuthorizationError } from '../lib/errors/authorization-error.js';

export function requireFeaturePermissionMiddleware(featureKey, options = {}) {
  const {
    requireSubscription = false,
    requireKyc = false,
  } = options;

  return function requireFeaturePermission(req, res, next) {
    if (!req.user) {
      return next(
        new AuthorizationError('Authentication required', {
          code: 'AUTH_REQUIRED',
        }),
      );
    }

    if (requireKyc && req.user.kycStatus !== 'VERIFIED') {
      return next(
        new AuthorizationError('KYC verification required', {
          code: 'KYC_REQUIRED',
          details: { feature: featureKey },
        }),
      );
    }

    if (requireSubscription && !req.user.subscriptionActive) {
      return next(
        new AuthorizationError('Active subscription required', {
          code: 'SUBSCRIPTION_REQUIRED',
          details: { feature: featureKey },
        }),
      );
    }

    const userFeatures = new Set(req.user.features || []);
    if (featureKey && !userFeatures.has(featureKey)) {
      return next(
        new AuthorizationError('Feature not available on your plan', {
          code: 'FEATURE_NOT_AVAILABLE',
          details: { feature: featureKey },
        }),
      );
    }

    return next();
  };
}

export default requireFeaturePermissionMiddleware;