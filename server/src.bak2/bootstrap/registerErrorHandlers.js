/**
 * Error Handler Registration
 *
 * Registers the 404 handler and the global error handler. Must be
 * called after all routes have been registered.
 *
 * @module signalforge/server/bootstrap/registerErrorHandlers
 */
const { notFoundMiddleware } = require('../middleware/not-found.middleware.js');
const { errorHandlerMiddleware } = require('../middleware/error-handler.middleware.js');
function registerErrorHandlers(app) {
  app.use(notFoundMiddleware);
  app.use(errorHandlerMiddleware);
  return app;
}
module.exports = registerErrorHandlers;
module.exports.registerErrorHandlers = registerErrorHandlers;
