/**
 * Telegram Controller
 *
 * @module signalforge/server/modules/signal-sources/telegram/controller
 */

import { TelegramAuthService } from './telegram-auth.service.js';
import { TelegramChannelService } from './telegram-channel.service.js';
import { TelegramSessionStoreService } from './telegram-session-store.service.js';
import { TelegramListenerService } from './telegram-listener.service.js';

export class TelegramController {
  constructor(dependencies = {}) {
    this.authService = dependencies.authService || new TelegramAuthService();
    this.channelService = dependencies.channelService || new TelegramChannelService();
    this.sessionStore = dependencies.sessionStore || new TelegramSessionStoreService();
    this.listenerService = dependencies.listenerService || new TelegramListenerService();
  }

  startLogin = async (req, res, next) => {
    try {
      const result = await this.authService.startLogin(
        req.user.id,
        req.body.phoneNumber,
        req.body.country,
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  verifyOtp = async (req, res, next) => {
    try {
      const result = await this.authService.verifyOtp(
        req.body.sessionId,
        req.body.otp,
        { country: req.body.country },
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  verifyPassword = async (req, res, next) => {
    try {
      const result = await this.authService.verifyPassword(
        req.body.sessionId,
        req.body.password,
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  logout = async (req, res, next) => {
    try {
      const result = await this.authService.logout(req.user.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  discoverChannels = async (req, res, next) => {
    try {
      const channels = await this.channelService.discover(req.user.id);
      res.status(200).json({ channels });
    } catch (error) {
      next(error);
    }
  };

  listChannels = async (req, res, next) => {
    try {
      const filters = {
        optInStatus: req.query.optInStatus,
      };
      const channels = await this.channelService.list(req.user.id, filters);
      res.status(200).json({ channels });
    } catch (error) {
      next(error);
    }
  };

  optInChannel = async (req, res, next) => {
    try {
      const result = await this.channelService.optIn(req.user.id, req.params.channelId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  optOutChannel = async (req, res, next) => {
    try {
      const result = await this.channelService.optOut(req.user.id, req.params.channelId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  listOptedInChannels = async (req, res, next) => {
    try {
      const channels = await this.channelService.listOptedIn(req.user.id);
      res.status(200).json({ channels });
    } catch (error) {
      next(error);
    }
  };

  getConnectionStatus = async (req, res, next) => {
    try {
      const connection = await this.sessionStore.getStatus(req.params.connectionId);
      if (!connection) {
        return res.status(404).json({
          error: { code: 'CONNECTION_NOT_FOUND', message: 'Telegram connection not found' },
        });
      }
      res.status(200).json({ connection });
    } catch (error) {
      next(error);
    }
  };

  startListener = async (req, res, next) => {
    try {
      const result = await this.listenerService.start(req.user.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  stopListener = async (req, res, next) => {
    try {
      const result = await this.listenerService.stop(req.user.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}

export default TelegramController;