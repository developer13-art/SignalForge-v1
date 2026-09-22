/**
 * Helmet Middleware
 *
 * Applies security-related HTTP headers using Helmet. Headers are
 * derived from `security.config.js`.
 *
 * @module signalforge/server/middleware/helmet
 */

import helmet from 'helmet';

import securityConfig from '../config/security.config.js';

export function helmetMiddleware() {
  const csp = securityConfig.headers.contentSecurityPolicy;
  const hsts = securityConfig.headers.hsts;

  return helmet({
    contentSecurityPolicy: csp.enabled
      ? {
          useDefaults: false,
          directives: csp.directives,
        }
      : false,
    hsts: hsts.enabled
      ? {
          maxAge: hsts.maxAge,
          includeSubDomains: hsts.includeSubDomains,
          preload: hsts.preload,
        }
      : false,
    referrerPolicy: {
      policy: securityConfig.headers.referrerPolicy,
    },
    frameguard: {
      action: securityConfig.headers.xFrameOptions.toLowerCase(),
    },
    noSniff: true,
    xssFilter: true,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'same-site' },
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    originAgentCluster: true,
    dnsPrefetchControl: { allow: false },
    ieNoOpen: true,
    permittedCrossDomainPolicies: { permittedPolicies: 'none' },
  });
}

export default helmetMiddleware;