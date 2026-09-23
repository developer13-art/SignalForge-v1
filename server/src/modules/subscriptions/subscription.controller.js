/**
 * Subscription Controller
 *
 * @module signalforge/server/modules/subscriptions/controller
 */

import { SubscriptionService } from './subscription.service.js';
import { PlanController } from './plans/plan.controller.js';
import {
  validateSubscribePayload,
  validateCancelPayload,
  validateUpgradePayload,
} from './subscription.validator.js';
import { ValidationError } from '../../lib/errors/validation-error.js';

export class SubscriptionController {
  constructor(service = null) {
    this.service = service || new SubscriptionService();
    this.planController = new PlanController(this.service.plans);
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

  listPlans = async (req, res, next) => {
    return this.planController.listPlans(req, res, next);
  };

  getPlan = async (req, res, next) => {
    return this.planController.getPlan(req, res, next);
  };

  getPlanByCode = async (req, res, next) => {
    return this.planController.getPlanByCode(req, res, next);
  };

  subscribe = async (req, res, next) => {
    try {
      this.validateOrThrow(validateSubscribePayload, req.body);
      const subscription = await this.service.subscribe(req.user.id, req.body);
      res.status(201).json({ subscription });
    } catch (error) {
      next(error);
    }
  };

  getSubscription = async (req, res, next) => {
    try {
      const subscription = await this.service.getSubscription(
        req.user.id,
        req.params.subscriptionId,
      );
      res.status(200).json({ subscription });
    } catch (error) {
      next(error);
    }
  };

  getActiveSubscription = async (req, res, next) => {
    try {
      const subscription = await this.service.getActiveSubscription(req.user.id);
      res.status(200).json({ subscription });
    } catch (error) {
      next(error);
    }
  };

  getLatestSubscription = async (req, res, next) => {
    try {
      const subscription = await this.service.getLatestSubscription(req.user.id);
      res.status(200).json({ subscription });
    } catch (error) {
      next(error);
    }
  };

  listSubscriptions = async (req, res, next) => {
    try {
      const filters = {
        status: req.query.status,
        planCode: req.query.planCode,
        since: req.query.since,
      };
      const pagination = { limit: req.query.limit, offset: req.query.offset };
      const result = await this.service.listSubscriptions(
        req.user.id,
        filters,
        pagination,
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  cancel = async (req, res, next) => {
    try {
      this.validateOrThrow(validateCancelPayload, req.body);
      const subscription = await this.service.cancel(
        req.user.id,
        req.params.subscriptionId,
        req.body,
      );
      res.status(200).json({ subscription });
    } catch (error) {
      next(error);
    }
  };

  resume = async (req, res, next) => {
    try {
      const result = await this.service.resume(req.user.id, req.params.subscriptionId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  upgrade = async (req, res, next) => {
    try {
      this.validateOrThrow(validateUpgradePayload, req.body);
      const subscription = await this.service.upgrade(req.user.id, req.body.planCode);
      res.status(200).json({ subscription });
    } catch (error) {
      next(error);
    }
  };

  downgrade = async (req, res, next) => {
    try {
      this.validateOrThrow(validateUpgradePayload, req.body);
      const subscription = await this.service.downgrade(req.user.id, req.body.planCode);
      res.status(200).json({ subscription });
    } catch (error) {
      next(error);
    }
  };

  getUsage = async (req, res, next) => {
    try {
      const usage = await this.service.getUsageSummary(req.user.id);
      res.status(200).json(usage);
    } catch (error) {
      next(error);
    }
  };

  incrementUsage = async (req, res, next) => {
    try {
      const result = await this.service.incrementUsage(
        req.user.id,
        req.body.metric,
        req.body.amount || 1,
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  checkUsage = async (req, res, next) => {
    try {
      const result = await this.service.checkUsage(
        req.user.id,
        req.query.metric,
        Number(req.query.amount) || 0,
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  processLifecycle = async (req, res, next) => {
    try {
      const result = await this.service.processLifecycleJobs();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}

export default SubscriptionController;