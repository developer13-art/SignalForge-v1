/**
 * Signal Validation Routes
 *
 * @module signalforge/server/modules/validation/routes
 */

import { Router } from 'express';

import { ValidationController } from './validation.controller.js';
import { authenticationMiddleware } from '../../middleware/authentication.middleware.js';
import { requireAdminMiddleware } from '../../middleware/require-admin.middleware.js';

export function buildValidationRouter(controller = null) {
  const router = Router();
  const validationController = controller || new ValidationController();

  router.use(authenticationMiddleware());

  router.post('/validate', validationController.validate);
  router.get('/validations', requireAdminMiddleware(), validationController.list);
  router.get('/validations/stats', requireAdminMiddleware(), validationController.stats);
  router.get('/validations/:validationId', validationController.getById);
  router.get('/signals/:signalId/latest', validationController.getLatestBySignal);
  router.get('/signals/:signalId/all', validationController.listBySignal);

  return router;
}

export default buildValidationRouter;