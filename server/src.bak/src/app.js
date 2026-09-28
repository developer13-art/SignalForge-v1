'use strict';

/**
 * SignalForge AI - Express Application
 *
 * Composes the Express application, installs middleware in the
 * correct order, registers routes, and installs error handlers.
 * This module does not start an HTTP server; that is done in
 * `server.js`.
 *
 * @module signalforge/server/app
 */

const express = require('express');

const { logger } = require('./lib/logger.js');
const { requestIdMiddleware } = require('./middleware/request-id.middleware.js');
const { requestLoggerMiddleware } = require('./middleware/request-logger.middleware.js');
const { responseTimeMiddleware } = require('./middleware/response-time.middleware.js');
const { corsMiddleware } = require('./middleware/cors.middleware.js');
const { helmetMiddleware } = require('./middleware/helmet.middleware.js');
const { compressionMiddleware } = require('./middleware/compression.middleware.js');
const { rateLimitMiddleware } = require('./middleware/rate-limit.middleware.js');
const { bodyParserMiddleware } = require('./middleware/body-parser.middleware.js');
const { cookieParserMiddleware } = require('./middleware/cookie-parser.middleware.js');
const { sessionMiddleware } = require('./middleware/session.middleware.js');
const {
  tenantResolverMiddleware,
} = require('./middleware/tenant-resolver.middleware.js');
const {
  whiteLabelResolverMiddleware,
} = require('./middleware/white-label-resolver.middleware.js');
const { registerRoutes } = require('./bootstrap/registerRoutes.js');
const { notFoundMiddleware } = require('./middleware/not-found.middleware.js');
const { errorHandlerMiddleware } = require('./middleware/error-handler.middleware.js');

function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(requestIdMiddleware);
  app.use(requestLoggerMiddleware);
  app.use(responseTimeMiddleware);

  app.use(helmetMiddleware());
  app.use(corsMiddleware());
  app.use(compressionMiddleware());

  app.use('/api/webhooks', express.raw({ type: '*/*', limit: '5mb' }));

  app.use(bodyParserMiddleware());
  app.use(cookieParserMiddleware());

  app.use(sessionMiddleware());
  app.use(rateLimitMiddleware());

  app.use(tenantResolverMiddleware);
  app.use(whiteLabelResolverMiddleware);

  registerRoutes(app);

  app.use(notFoundMiddleware);
  app.use(errorHandlerMiddleware);

  logger.debug('Express application composed');

  return app;
}

module.exports = {
  createApp,
};