/**
 * Discord Routes
 *
 * @module signalforge/server/modules/signal-sources/discord/routes
 */

import { Router } from 'express';

import { DiscordController } from './discord.controller.js';
import { authenticationMiddleware } from '../../../middleware/authentication.middleware.js';

export function buildDiscordRouter(controller = null) {
  const router = Router();
  const discordController = controller || new DiscordController();

  router.get('/authorize', authenticationMiddleware(), discordController.getAuthorizeUrl);
  router.get('/callback', authenticationMiddleware(), discordController.handleCallback);

  router.get('/guilds', authenticationMiddleware(), discordController.listGuilds);
  router.get('/guilds/:guildId/channels', authenticationMiddleware(), discordController.listChannels);
  router.put('/channels', authenticationMiddleware(), discordController.updateChannels);

  return router;
}

export default buildDiscordRouter;