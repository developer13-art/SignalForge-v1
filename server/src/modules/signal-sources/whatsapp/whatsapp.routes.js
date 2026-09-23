/**
 * WhatsApp Routes
 *
 * @module signalforge/server/modules/signal-sources/whatsapp/routes
 */

import { Router } from 'express';

import { WhatsAppController } from './whatsapp.controller.js';
import { authenticationMiddleware } from '../../../middleware/authentication.middleware.js';

export function buildWhatsAppRouter(controller = null) {
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

export default buildWhatsAppRouter;