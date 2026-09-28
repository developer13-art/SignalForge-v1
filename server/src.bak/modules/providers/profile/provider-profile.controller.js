/**
 * Provider Profile Controller
 *
 * @module signalforge/server/modules/providers/profile/controller
 */

import { ProviderProfileService } from './service.js';

export class ProviderProfileController {
  constructor(service = null) {
    this.service = service || new ProviderProfileService();
  }

  getProfile = async (req, res, next) => {
    try {
      const profile = await this.service.getProfile(req.params.providerId);
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
        req.params.providerId,
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
        req.params.providerId,
        req.body.avatarUrl,
      );
      res.status(200).json({ profile });
    } catch (error) {
      next(error);
    }
  };

  removeAvatar = async (req, res, next) => {
    try {
      const profile = await this.service.removeAvatar(req.user.id, req.params.providerId);
      res.status(200).json({ profile });
    } catch (error) {
      next(error);
    }
  };

  listPublic = async (req, res, next) => {
    try {
      const filters = {
        search: req.query.search,
        providerType: req.query.providerType,
        minSubscribers:
          req.query.minSubscribers !== undefined ? Number(req.query.minSubscribers) : undefined,
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

export default ProviderProfileController;