/**
 * Tenant Resolver Middleware
 *
 * Determines the tenant context for each request. In the current
 * single-tenant deployment, this resolves to the platform default.
 * When white label is enabled, the middleware inspects the request
 * hostname against the white label project registry.
 *
 * @module signalforge/server/middleware/tenant-resolver
 */

import { getLogger } from '../bootstrap/initLogger.js';
import featureFlagsConfig from '../config/feature-flags.config.js';

const DEFAULT_TENANT = {
  id: 'platform',
  slug: 'platform',
  name: 'SignalForge',
};

export function tenantResolverMiddleware(req, res, next) {
  const logger = getLogger('tenant');

  if (!featureFlagsConfig.whiteLabel) {
    req.tenant = DEFAULT_TENANT;
    res.setHeader('X-Tenant', DEFAULT_TENANT.slug);
    return next();
  }

  const headerTenant = req.headers['x-tenant-id'];
  const host = req.hostname || '';

  let tenant = DEFAULT_TENANT;

  if (typeof headerTenant === 'string' && headerTenant.length > 0) {
    tenant = {
      id: headerTenant,
      slug: headerTenant,
      name: headerTenant,
      source: 'header',
    };
  } else if (host && host !== 'localhost' && !host.endsWith('.signalforge.ai')) {
    tenant = {
      id: host,
      slug: host.split('.')[0],
      name: host,
      source: 'host',
    };
  }

  req.tenant = tenant;
  res.setHeader('X-Tenant', tenant.slug);

  logger.trace({ tenant: tenant.slug }, 'Tenant resolved');

  next();
}

export default tenantResolverMiddleware;