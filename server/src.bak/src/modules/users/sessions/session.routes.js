/**
 * Session Routes (User Module)
 *
 * @module signalforge/server/modules/users/sessions/routes
 */
const { Router } = require('express');
const { SessionController } = require('./session.controller.js');
const { authenticationMiddleware } = require('../../../middleware/authentication.middleware.js');
function buildSessionRouter(controller = null) {
  const router = Router();
  const sessionController = controller || new SessionController();

  router.use(authenticationMiddleware());

  router.get('/', sessionController.listSessions);
  router.delete('/:sessionId', sessionController.revokeSession);
  router.post('/revoke-all', sessionController.revokeAllSessions);

  return router;
}
module.exports = buildSessionRouter;
module.exports.buildSessionRouter = buildSessionRouter;
