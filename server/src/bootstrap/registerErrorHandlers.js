/**
 * Error Handler Registration
 *
 * Registers the 404 handler and the global error handler. Must be
 * called after all routes have been registered.
 *
 * @module signalforge/server/bootstrap/registerErrorHandlers
 */

import { notFoundMiddleware } from '../middleware/not-found.middleware.js';
import { errorHandlerMiddleware } from '../middleware/error-handler.middleware.js';

export function registerErrorHandlers(app) {
  app.use(notFoundMiddleware);
  app.use(errorHandlerMiddleware);
  return app;
}

export default registerErrorHandlers;