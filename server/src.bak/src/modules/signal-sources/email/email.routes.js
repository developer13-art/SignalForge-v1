/**
 * Email Routes
 *
 * @module signalforge/server/modules/signal-sources/email/routes
 */
const { Router } = require('express');
const { EmailController } = require('./email.controller.js');
const { authenticationMiddleware } = require('../../../middleware/authentication.middleware.js');
function buildEmailRouter(controller = null) {
  const router = Router();
  const emailController = controller || new EmailController();

  router.use(authenticationMiddleware());

  router.post('/connections', emailController.createConnection);
  router.get('/connections/me', emailController.getConnection);
  router.patch('/connections/me', emailController.updateConnection);
  router.delete('/connections/me', emailController.deleteConnection);

  return router;
}
module.exports = buildEmailRouter;
module.exports.buildEmailRouter = buildEmailRouter;
