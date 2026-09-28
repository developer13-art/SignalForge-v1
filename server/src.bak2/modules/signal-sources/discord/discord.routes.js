/**
 * Discord Routes
 *
 * @module signalforge/server/modules/signal-sources/discord/routes
 */
const { Router } = require('express');
const { DiscordController } = require('./discord.controller.js');
const { authenticationMiddleware } = require('../../../middleware/authentication.middleware.js');
function buildDiscordRouter(controller = null) {
  const router = Router();
  const discordController = controller || new DiscordController();

  router.get('/authorize', authenticationMiddleware(), discordController.getAuthorizeUrl);
  router.get('/callback', authenticationMiddleware(), discordController.handleCallback);

  router.get('/guilds', authenticationMiddleware(), discordController.listGuilds);
  router.get('/guilds/:guildId/channels', authenticationMiddleware(), discordController.listChannels);
  router.put('/channels', authenticationMiddleware(), discordController.updateChannels);

  return router;
}
module.exports = buildDiscordRouter;
module.exports.buildDiscordRouter = buildDiscordRouter;
