'use strict';

const routes = require('../routes');
const solanaActionsMiddleware = require('../modules/solana/actions/actions.middleware');

/**
 * SignalForge - Route Registration
 *
 * Mounts the global API surface. Solana Actions endpoints must be
 * mounted before the general API so that their CORS middleware runs
 * before the platform-wide CORS middleware.
 */
function registerRoutes(app) {
  // Mount Solana Actions first: their CORS middleware is stricter
  // and must run before the general API CORS.
  app.use(
    '/api/actions',
    solanaActionsMiddleware.corsMiddleware,
    require('../modules/solana/actions/actions.routes'),
  );

  // Mount all other routes under /api.
  app.use('/api', routes);

  // Not found handler for the API surface.
  app.use('/api', (_req, res) => {
    res.status(404).json({
      message: 'Endpoint not found',
      error: { code: 'NOT_FOUND' },
    });
  });

  return app;
}

module.exports = registerRoutes;