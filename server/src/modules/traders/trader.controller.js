/**
 * Trader Controller
 *
 * @module signalforge/server/modules/traders/controller
 */

import { TraderService } from './service.js';
import { TraderProfileController } from './profile/controller.js';
import {
  validateTraderRegistrationPayload,
  validateTraderUpdatePayload,
  validateFollowPayload,
  validateCopySettingsPayload,
} from './trader.validator.js';
import { ValidationError } from '../../lib/errors/validation-error.js';

export class TraderController {
  constructor(service = null) {
    this.service = service || new TraderService();
    this.profileController = new TraderProfileController(this.service.profile);
  }

  validateOrThrow(validator, body) {
    const result = validator(body);
    if (!result.valid) {
      throw new ValidationError('Validation failed', {
        code: 'VALIDATION_FAILED',
        details: { errors: result.errors },
      });
    }
  }

  register = async (req, res, next) => {
    try {
      this.validateOrThrow(validateTraderRegistrationPayload, req.body);
      const trader = await this.service.register(req.user.id, req.body);
      res.status(201).json({ trader });
    } catch (error) {
      next(error);
    }
  };

  listPublicTraders = async (req, res, next) => {
    return this.profileController.listPublic(req, res, next);
  };

  listTraders = async (req, res, next) => {
    try {
      const filters = {
        status: req.query.status,
        visibility: req.query.visibility,
        tradingStyle: req.query.tradingStyle,
        riskStyle: req.query.riskStyle,
        search: req.query.search,
        minFollowers:
          req.query.minFollowers !== undefined ? Number(req.query.minFollowers) : undefined,
        minWinRate: req.query.minWinRate !== undefined ? Number(req.query.minWinRate) : undefined,
      };
      const pagination = { limit: req.query.limit, offset: req.query.offset };
      const result = await this.service.listTraders(filters, pagination);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getTrader = async (req, res, next) => {
    try {
      const trader = await this.service.getById(req.params.traderId);
      res.status(200).json({ trader });
    } catch (error) {
      next(error);
    }
  };

  getTraderBySlug = async (req, res, next) => {
    return this.profileController.getProfileBySlug(req, res, next);
  };

  getMyTrader = async (req, res, next) => {
    try {
      const trader = await this.service.getByUserId(req.user.id);
      res.status(200).json({ trader });
    } catch (error) {
      next(error);
    }
  };

  getMyProfile = async (req, res, next) => {
    return this.profileController.getMyProfile(req, res, next);
  };

  updateMyProfile = async (req, res, next) => {
    return this.profileController.updateMyProfile(req, res, next);
  };

  updateAvatar = async (req, res, next) => {
    return this.profileController.updateAvatar(req, res, next);
  };

  removeAvatar = async (req, res, next) => {
    return this.profileController.removeAvatar(req, res, next);
  };

  updateTrader = async (req, res, next) => {
    try {
      this.validateOrThrow(validateTraderUpdatePayload, req.body);
      const trader = await this.service.updateTrader(req.params.traderId, req.body);
      res.status(200).json({ trader });
    } catch (error) {
      next(error);
    }
  };

  approve = async (req, res, next) => {
    try {
      const trader = await this.service.approve(req.params.traderId, req.user.id);
      res.status(200).json({ trader });
    } catch (error) {
      next(error);
    }
  };

  suspend = async (req, res, next) => {
    try {
      const trader = await this.service.suspend(
        req.params.traderId,
        req.user.id,
        req.body.reason,
      );
      res.status(200).json({ trader });
    } catch (error) {
      next(error);
    }
  };

  reinstate = async (req, res, next) => {
    try {
      const trader = await this.service.reinstate(req.params.traderId, req.user.id);
      res.status(200).json({ trader });
    } catch (error) {
      next(error);
    }
  };

  getStats = async (req, res, next) => {
    try {
      const byStatus = await this.service.countByStatus();
      const byTradingStyle = await this.service.countByTradingStyle();
      res.status(200).json({ byStatus, byTradingStyle });
    } catch (error) {
      next(error);
    }
  };

  follow = async (req, res, next) => {
    try {
      this.validateOrThrow(validateFollowPayload, req.body);
      const follower = await this.service.follow(
        req.params.traderId,
        req.user.id,
        req.body,
      );
      res.status(201).json({ follower });
    } catch (error) {
      next(error);
    }
  };

  unfollow = async (req, res, next) => {
    try {
      const result = await this.service.unfollow(req.params.traderId, req.user.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  pauseFollowing = async (req, res, next) => {
    try {
      const follower = await this.service.pauseFollowing(req.params.traderId, req.user.id);
      res.status(200).json({ follower });
    } catch (error) {
      next(error);
    }
  };

  resumeFollowing = async (req, res, next) => {
    try {
      const follower = await this.service.resumeFollowing(req.params.traderId, req.user.id);
      res.status(200).json({ follower });
    } catch (error) {
      next(error);
    }
  };

  listFollowers = async (req, res, next) => {
    try {
      const filters = { status: req.query.status };
      const pagination = { limit: req.query.limit, offset: req.query.offset };
      const result = await this.service.listFollowers(
        req.params.traderId,
        filters,
        pagination,
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  listFollowing = async (req, res, next) => {
    try {
      const filters = { status: req.query.status };
      const pagination = { limit: req.query.limit, offset: req.query.offset };
      const result = await this.service.listFollowing(req.user.id, filters, pagination);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getCopySettings = async (req, res, next) => {
    try {
      const settings = await this.service.getCopySettings(
        req.params.traderId,
        req.user.id,
      );
      res.status(200).json({ settings });
    } catch (error) {
      next(error);
    }
  };

  updateCopySettings = async (req, res, next) => {
    try {
      this.validateOrThrow(validateCopySettingsPayload, req.body);
      const settings = await this.service.updateCopySettings(
        req.params.traderId,
        req.user.id,
        req.body,
      );
      res.status(200).json({ settings });
    } catch (error) {
      next(error);
    }
  };

  getLeaderboard = async (req, res, next) => {
    try {
      const metric = req.query.metric;
      const period = req.query.period;
      const limit = req.query.limit;
      const leaderboard = await this.service.getLeaderboard(metric, period, limit);
      res.status(200).json(leaderboard);
    } catch (error) {
      next(error);
    }
  };

  getTopTraders = async (req, res, next) => {
    try {
      const metric = req.query.metric;
      const limit = Number(req.query.limit) || 20;
      const leaderboard = await this.service.getTopTraders(metric, limit);
      res.status(200).json(leaderboard);
    } catch (error) {
      next(error);
    }
  };

  getConsistencyLeaders = async (req, res, next) => {
    try {
      const limit = Number(req.query.limit) || 20;
      const leaderboard = await this.service.getConsistencyLeaders(limit);
      res.status(200).json(leaderboard);
    } catch (error) {
      next(error);
    }
  };
}

export default TraderController;