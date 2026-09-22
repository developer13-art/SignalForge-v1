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

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';

import { logger } from './lib/logger.js';
import { requestIdMiddleware } from './middleware/request-id.middleware.js';
import { requestLoggerMiddleware } from './middleware/request-logger.middleware.js';
import { responseTimeMiddleware } from './middleware/response-time.middleware.js';
import { corsMiddleware } from './middleware/cors.middleware.js';
import { helmetMiddleware } from './middleware/helmet.middleware.js';
import { compressionMiddleware } from './middleware/compression.middleware.js';
import { rateLimitMiddleware } from './middleware/rate-limit.middleware.js';
import { bodyParserMiddleware } from './middleware/body-parser.middleware.js';
import { cookieParserMiddleware } from './middleware/cookie-parser.middleware.js';
import { sessionMiddleware } from './middleware/session.middleware.js';
import { tenantResolverMiddleware } from './middleware/tenant-resolver.middleware.js';
import { whiteLabelResolverMiddleware } from './middleware/white-label-resolver.middleware.js';
import { registerRoutes } from './bootstrap/registerRoutes.js';
import { notFoundMiddleware } from './middleware/not-found.middleware.js';
import { errorHandlerMiddleware } from './middleware/error-handler.middleware.js';

export function createApp() {
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