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
const { requestIdMiddleware } = require('../middleware/request-id.middleware.js');
const { requestLoggerMiddleware } = require('../middleware/request-logger.middleware.js');
const { responseTimeMiddleware } = require('../middleware/response-time.middleware.js');
const { corsMiddleware } = require('../middleware/cors.middleware.js');
const { helmetMiddleware } = require('../middleware/helmet.middleware.js');
const { compressionMiddleware } = require('../middleware/compression.middleware.js');
const { rateLimitMiddleware } = require('../middleware/rate-limit.middleware.js');
const { bodyParserMiddleware } = require('../middleware/body-parser.middleware.js');
const { cookieParserMiddleware } = require('../middleware/cookie-parser.middleware.js');
const { sessionMiddleware } = require('../middleware/session.middleware.js');
const { tenantResolverMiddleware } = require('../middleware/tenant-resolver.middleware.js');
const { whiteLabelResolverMiddleware } = require('../middleware/white-label-resolver.middleware.js');
function registerMiddleware(app, options = {}) {
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
module.exports = registerMiddleware;
module.exports.registerMiddleware = registerMiddleware;
