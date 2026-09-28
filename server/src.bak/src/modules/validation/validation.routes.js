/**
 * Signal Validation Routes
 *
 * @module signalforge/server/modules/validation/routes
 */
const { Router } = require('express');
const { ValidationController } = require('./validation.controller.js');
const { authenticationMiddleware } = require('../../middleware/authentication.middleware.js');
const { requireAdminMiddleware } = require('../../middleware/require-admin.middleware.js');
function buildValidationRouter(controller = null) {
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
module.exports = buildValidationRouter;
module.exports.buildValidationRouter = buildValidationRouter;
