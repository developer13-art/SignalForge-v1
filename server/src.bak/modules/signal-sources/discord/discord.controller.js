/**
 * Discord Controller
 *
 * @module signalforge/server/modules/signal-sources/discord/controller
 */

import { DiscordService } from './discord.service.js';

export class DiscordController {
  constructor(service = null) {
    this.service = service || new DiscordService();
  }

  getAuthorizeUrl = async (req, res, next) => {
    try {
      const result = await this.service.getAuthorizeUrl(req.query.state);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  handleCallback = async (req, res, next) => {
    try {
      const result = await this.service.handleCallback(
        req.user.id,
        req.query.code,
        req.query.guild_id,
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  listGuilds = async (req, res, next) => {
    try {
      const result = await this.service.listGuilds(req.user.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  listChannels = async (req, res, next) => {
    try {
      const result = await this.service.listChannels(req.user.id, req.params.guildId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  updateChannels = async (req, res, next) => {
    try {
      const result = await this.service.updateChannels(req.user.id, req.body.channelIds || []);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}

export default DiscordController;