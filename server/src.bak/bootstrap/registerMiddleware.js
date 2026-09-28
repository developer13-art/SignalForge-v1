/**
 * Middleware Registration
 *
 * Provides a function to register a middleware stack on a target
 * Express router or application. This module is used by tests and
 * by specialised routers that require a standalone middleware chain.
 *
 * The main application composition is handled in `app.js`; this
 * module exists for cases where a custom Express app is built.
 *
 * @module signalforge/server/bootstrap/registerMiddleware
 */

import { requestIdMiddleware } from '../middleware/request-id.middleware.js';
import { requestLoggerMiddleware } from '../middleware/request-logger.middleware.js';
import { responseTimeMiddleware } from '../middleware/response-time.middleware.js';
import { corsMiddleware } from '../middleware/cors.middleware.js';
import { helmetMiddleware } from '../middleware/helmet.middleware.js';
import { compressionMiddleware } from '../middleware/compression.middleware.js';
import { rateLimitMiddleware } from '../middleware/rate-limit.middleware.js';
import { bodyParserMiddleware } from '../middleware/body-parser.middleware.js';
import { cookieParserMiddleware } from '../middleware/cookie-parser.middleware.js';
import { sessionMiddleware } from '../middleware/session.middleware.js';
import { tenantResolverMiddleware } from '../middleware/tenant-resolver.middleware.js';
import { whiteLabelResolverMiddleware } from '../middleware/white-label-resolver.middleware.js';

export function registerMiddleware(app, options = {}) {
  const {
    includeRateLimit = true,
    includeSession = true,
    includeTenant = true,
    includeWhiteLabel = true,
  } = options;

  app.use(requestIdMiddleware);
  app.use(requestLoggerMiddleware);
  app.use(responseTimeMiddleware);

  app.use(helmetMiddleware());
  app.use(corsMiddleware());
  app.use(compressionMiddleware());

  app.use(bodyParserMiddleware());
  app.use(cookieParserMiddleware());

  if (includeSession) {
    app.use(sessionMiddleware());
  }

  if (includeRateLimit) {
    app.use(rateLimitMiddleware());
  }

  if (includeTenant) {
    app.use(tenantResolverMiddleware);
  }

  if (includeWhiteLabel) {
    app.use(whiteLabelResolverMiddleware);
  }

  return app;
}

export default registerMiddleware;