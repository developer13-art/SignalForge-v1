/**
 * White Label Resolver Middleware
 *
 * Resolves branding and configuration for white label deployments.
 * When white label is disabled, this middleware is a no-op.
 *
 * @module signalforge/server/middleware/white-label-resolver
 */
const { getLogger } = require('../bootstrap/initLogger.js');
const featureFlagsConfig = require('../config/feature-flags.config.js');
function whiteLabelResolverMiddleware(req, res, next) {
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
module.exports = whiteLabelResolverMiddleware;
module.exports.whiteLabelResolverMiddleware = whiteLabelResolverMiddleware;
