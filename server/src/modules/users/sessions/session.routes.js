/**
 * Session Routes (User Module)
 *
 * @module signalforge/server/modules/users/sessions/routes
 */

import { Router } from 'express';

import { SessionController } from './session.controller.js';
import { authenticationMiddleware } from '../../../middleware/authentication.middleware.js';

export function buildSessionRouter(controller = null) {
  const router = Router();
  const sessionController = controller || new SessionController();

  router.use(authenticationMiddleware());

  router.get('/', sessionController.listSessions);
  router.delete('/:sessionId', sessionController.revokeSession);
  router.post('/revoke-all', sessionController.revokeAllSessions);

  return router;
}

export default buildSessionRouter;