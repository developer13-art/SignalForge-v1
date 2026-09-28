/**
 * Email Routes
 *
 * @module signalforge/server/modules/signal-sources/email/routes
 */

import { Router } from 'express';

import { EmailController } from './email.controller.js';
import { authenticationMiddleware } from '../../../middleware/authentication.middleware.js';

export function buildEmailRouter(controller = null) {
  const router = Router();
  const emailController = controller || new EmailController();

  router.use(authenticationMiddleware());

  router.post('/connections', emailController.createConnection);
  router.get('/connections/me', emailController.getConnection);
  router.patch('/connections/me', emailController.updateConnection);
  router.delete('/connections/me', emailController.deleteConnection);

  return router;
}

export default buildEmailRouter;