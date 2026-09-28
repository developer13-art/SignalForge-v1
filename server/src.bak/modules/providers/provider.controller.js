/**
 * Provider Controller
 *
 * @module signalforge/server/modules/providers/controller
 */

import { ProviderService } from './service.js';
import { ProviderProfileController } from './profile/controller.js';
import { CertificationController } from './certification/controller.js';
import { validateProviderRegistrationPayload, validateProviderUpdatePayload } from './provider.validator.js';
import { ValidationError } from '../../lib/errors/validation-error.js';

export class ProviderController {
  constructor(service = null) {
    this.service = service || new ProviderService();
    this.profileController = new ProviderProfileController(this.service.profile);
    this.certificationController = new CertificationController(this.service.certifications);
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
      this.validateOrThrow(validateProviderRegistrationPayload, req.body);
      const provider = await this.service.register(req.user.id, req.body);
      res.status(201).json({ provider });
    } catch (error) {
      next(error);
    }
  };

  listProviders = async (req, res, next) => {
    try {
      const filters = {
        status: req.query.status,
        certificationStatus: req.query.certificationStatus,
        visibility: req.query.visibility,
        providerType: req.query.providerType,
        search: req.query.search,
        minSubscribers:
          req.query.minSubscribers !== undefined ? Number(req.query.minSubscribers) : undefined,
        minWinRate: req.query.minWinRate !== undefined ? Number(req.query.minWinRate) : undefined,
      };
      const pagination = { limit: req.query.limit, offset: req.query.offset };
      const result = await this.service.listProviders(filters, pagination);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getProvider = async (req, res, next) => {
    try {
      const provider = await this.service.getProviderById(req.params.providerId);
      res.status(200).json({ provider });
    } catch (error) {
      next(error);
    }
  };

  getMyProvider = async (req, res, next) => {
    try {
      const provider = await this.service.getProviderByUserId(req.user.id);
      res.status(200).json({ provider });
    } catch (error) {
      next(error);
    }
  };

  updateProvider = async (req, res, next) => {
    try {
      this.validateOrThrow(validateProviderUpdatePayload, req.body);
      const provider = await this.service.updateProvider(req.params.providerId, req.body);
      res.status(200).json({ provider });
    } catch (error) {
      next(error);
    }
  };

  approveProvider = async (req, res, next) => {
    try {
      const provider = await this.service.approve(req.params.providerId, req.user.id);
      res.status(200).json({ provider });
    } catch (error) {
      next(error);
    }
  };

  suspendProvider = async (req, res, next) => {
    try {
      const provider = await this.service.suspend(
        req.params.providerId,
        req.user.id,
        req.body.reason,
      );
      res.status(200).json({ provider });
    } catch (error) {
      next(error);
    }
  };

  reinstateProvider = async (req, res, next) => {
    try {
      const provider = await this.service.reinstate(req.params.providerId, req.user.id);
      res.status(200).json({ provider });
    } catch (error) {
      next(error);
    }
  };

  getStats = async (req, res, next) => {
    try {
      const byStatus = await this.service.countByStatus();
      const byCertification = await this.service.countByCertificationStatus();
      res.status(200).json({ byStatus, byCertification });
    } catch (error) {
      next(error);
    }
  };

  getProfile = async (req, res, next) => {
    return this.profileController.getProfile(req, res, next);
  };

  getProfileBySlug = async (req, res, next) => {
    return this.profileController.getProfileBySlug(req, res, next);
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

  listPublicProviders = async (req, res, next) => {
    return this.profileController.listPublic(req, res, next);
  };

  startCertification = async (req, res, next) => {
    return this.certificationController.startCertification(req, res, next);
  };

  getCertification = async (req, res, next) => {
    return this.certificationController.getCertification(req, res, next);
  };

  getLatestCertification = async (req, res, next) => {
    return this.certificationController.getLatestCertification(req, res, next);
  };

  listCertifications = async (req, res, next) => {
    return this.certificationController.listCertifications(req, res, next);
  };

  revokeCertification = async (req, res, next) => {
    return this.certificationController.revokeCertification(req, res, next);
  };

  expireDueCertifications = async (req, res, next) => {
    return this.certificationController.expireDue(req, res, next);
  };

  getRevenueDashboard = async (req, res, next) => {
    try {
      const filters = {
        fromPeriod: req.query.fromPeriod,
        toPeriod: req.query.toPeriod,
      };
      const dashboard = await this.service.dashboard.build(
        req.params.providerId,
        filters,
      );
      res.status(200).json(dashboard);
    } catch (error) {
      next(error);
    }
  };

  listRevenue = async (req, res, next) => {
    try {
      const filters = {
        fromPeriod: req.query.fromPeriod,
        toPeriod: req.query.toPeriod,
      };
      const pagination = { limit: req.query.limit, offset: req.query.offset };
      const result = await this.service.revenue.listRevenue(
        req.params.providerId,
        filters,
        pagination,
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getRevenueSummary = async (req, res, next) => {
    try {
      const filters = {
        fromPeriod: req.query.fromPeriod,
        toPeriod: req.query.toPeriod,
      };
      const summary = await this.service.revenue.getSummary(
        req.params.providerId,
        filters,
      );
      res.status(200).json({ summary });
    } catch (error) {
      next(error);
    }
  };

  recordRevenue = async (req, res, next) => {
    try {
      const record = await this.service.revenue.recordRevenue(
        req.params.providerId,
        req.user.id,
        req.body,
      );
      res.status(201).json({ record });
    } catch (error) {
      next(error);
    }
  };

  listSubscribers = async (req, res, next) => {
    try {
      const filters = { status: req.query.status };
      const pagination = { limit: req.query.limit, offset: req.query.offset };
      const result = await this.service.subscribers.listSubscribers(
        req.params.providerId,
        filters,
        pagination,
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  addSubscriber = async (req, res, next) => {
    try {
      const subscriber = await this.service.subscribers.addSubscriber(
        req.params.providerId,
        req.body.subscriberId,
        req.body.subscriptionId,
      );
      res.status(200).json({ subscriber });
    } catch (error) {
      next(error);
    }
  };

  removeSubscriber = async (req, res, next) => {
    try {
      const subscriber = await this.service.subscribers.removeSubscriber(
        req.params.providerId,
        req.params.subscriberId,
      );
      res.status(200).json({ subscriber });
    } catch (error) {
      next(error);
    }
  };

  createPromotion = async (req, res, next) => {
    try {
      const promotion = await this.service.promotions.create(
        req.params.providerId,
        req.user.id,
        req.body,
      );
      res.status(201).json({ promotion });
    } catch (error) {
      next(error);
    }
  };

  listPromotions = async (req, res, next) => {
    try {
      const filters = { status: req.query.status };
      const pagination = { limit: req.query.limit, offset: req.query.offset };
      const result = await this.service.promotions.list(
        req.params.providerId,
        filters,
        pagination,
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  updatePromotion = async (req, res, next) => {
    try {
      const promotion = await this.service.promotions.update(
        req.params.providerId,
        req.params.promotionId,
        req.body,
      );
      res.status(200).json({ promotion });
    } catch (error) {
      next(error);
    }
  };

  deletePromotion = async (req, res, next) => {
    try {
      const result = await this.service.promotions.delete(
        req.params.providerId,
        req.params.promotionId,
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getMarketingTemplates = async (req, res, next) => {
    try {
      const templates = this.service.marketing.listTemplates();
      res.status(200).json({ templates });
    } catch (error) {
      next(error);
    }
  };

  getSettings = async (req, res, next) => {
    try {
      const settings = await this.service.settings.getSettings(req.params.providerId);
      res.status(200).json({ settings });
    } catch (error) {
      next(error);
    }
  };

  updateSettings = async (req, res, next) => {
    try {
      const settings = await this.service.settings.updateSettings(
        req.params.providerId,
        req.body,
      );
      res.status(200).json({ settings });
    } catch (error) {
      next(error);
    }
  };
}

export default ProviderController;