/**
 * WhatsApp Routes
 *
 * @module signalforge/server/modules/signal-sources/whatsapp/routes
 */
const { Router } = require('express');
const { WhatsAppController } = require('./whatsapp.controller.js');
const { authenticationMiddleware } = require('../../../middleware/authentication.middleware.js');
function buildWhatsAppRouter(controller = null) {
  const router = Router();
  const whatsAppController = controller || new WhatsAppController();

  router.get('/webhook', whatsAppController.handleWebhook);
  router.post('/webhook', whatsAppController.handleWebhook);

  router.use(authenticationMiddleware());

  router.post('/connect', whatsAppController.connect);
  router.post('/disconnect', whatsAppController.disconnect);
  router.put('/groups', whatsAppController.updateGroups);

  return router;
}
module.exports = buildWhatsAppRouter;
module.exports.buildWhatsAppRouter = buildWhatsAppRouter;
