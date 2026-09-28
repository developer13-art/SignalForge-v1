/**
 * White Label Resolver Middleware
 *
 * Resolves branding and configuration for white label deployments.
 * When white label is disabled, this middleware is a no-op.
 *
 * @module signalforge/server/middleware/white-label-resolver
 */

import { getLogger } from '../bootstrap/initLogger.js';
import featureFlagsConfig from '../config/feature-flags.config.js';

export function whiteLabelResolverMiddleware(req, res, next) {
  const logger = getLogger('white-label');

  if (!featureFlagsConfig.whiteLabel) {
    req.whiteLabel = null;
    return next();
  }

  const tenant = req.tenant;
  if (!tenant || tenant.id === 'platform') {
    req.whiteLabel = null;
    return next();
  }

  req.whiteLabel = {
    projectId: tenant.id,
    slug: tenant.slug,
    domain: tenant.id,
  };

  logger.trace({ whiteLabel: tenant.slug }, 'White label resolved');

  next();
}

export default whiteLabelResolverMiddleware;