/**
 * Telegram Routes
 *
 * @module signalforge/server/modules/signal-sources/telegram/routes
 */
const { Router } = require('express');
const { TelegramController } = require('./telegram.controller.js');
const { authenticationMiddleware } = require('../../../middleware/authentication.middleware.js');
function buildTelegramRouter(controller = null) {
  const router = Router();
  const telegramController = controller || new TelegramController();

  router.use(authenticationMiddleware());

  router.post('/login/start', telegramController.startLogin);
  router.post('/login/verify-otp', telegramController.verifyOtp);
  router.post('/login/verify-2fa', telegramController.verifyPassword);
  router.post('/logout', telegramController.logout);

  router.get('/channels/discover', telegramController.discoverChannels);
  router.get('/channels', telegramController.listChannels);
  router.get('/channels/opted-in', telegramController.listOptedInChannels);
  router.post('/channels/:channelId/opt-in', telegramController.optInChannel);
  router.post('/channels/:channelId/opt-out', telegramController.optOutChannel);

  router.get('/connections/:connectionId/status', telegramController.getConnectionStatus);

  router.post('/listener/start', telegramController.startListener);
  router.post('/listener/stop', telegramController.stopListener);

  return router;
}
module.exports = buildTelegramRouter;
module.exports.buildTelegramRouter = buildTelegramRouter;
