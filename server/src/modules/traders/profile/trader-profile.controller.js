/**
 * Trader Profile Controller
 *
 * @module signalforge/server/modules/traders/profile/controller
 */

import { TraderProfileService } from './service.js';

export class TraderProfileController {
  constructor(service = null) {
    this.service = service || new TraderProfileService();
  }

  getProfile = async (req, res, next) => {
    try {
      const profile = await this.service.getProfile(req.params.traderId);
      res.status(200).json({ profile });
    } catch (error) {
      next(error);
    }
  };

  getProfileBySlug = async (req, res, next) => {
    try {
      const profile = await this.service.getProfileBySlug(req.params.slug);
      res.status(200).json({ profile });
    } catch (error) {
      next(error);
    }
  };

  getMyProfile = async (req, res, next) => {
    try {
      const profile = await this.service.getProfileByUserId(req.user.id);
      res.status(200).json({ profile });
    } catch (error) {
      next(error);
    }
  };

  updateMyProfile = async (req, res, next) => {
    try {
      const profile = await this.service.updateProfile(
        req.user.id,
        req.params.traderId,
        req.body,
      );
      res.status(200).json({ profile });
    } catch (error) {
      next(error);
    }
  };

  updateAvatar = async (req, res, next) => {
    try {
      const profile = await this.service.updateAvatar(
        req.user.id,
        req.params.traderId,
        req.body.avatarUrl,
      );
      res.status(200).json({ profile });
    } catch (error) {
      next(error);
    }
  };

  removeAvatar = async (req, res, next) => {
    try {
      const profile = await this.service.removeAvatar(req.user.id, req.params.traderId);
      res.status(200).json({ profile });
    } catch (error) {
      next(error);
    }
  };

  listPublic = async (req, res, next) => {
    try {
      const filters = {
        search: req.query.search,
        tradingStyle: req.query.tradingStyle,
        riskStyle: req.query.riskStyle,
        minFollowers:
          req.query.minFollowers !== undefined ? Number(req.query.minFollowers) : undefined,
        minWinRate: req.query.minWinRate !== undefined ? Number(req.query.minWinRate) : undefined,
      };
      const pagination = { limit: req.query.limit, offset: req.query.offset };
      const result = await this.service.listPublic(filters, pagination);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}

export default TraderProfileController;