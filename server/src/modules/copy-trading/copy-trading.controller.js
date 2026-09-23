/**
 * Copy Trading Controller
 *
 * @module signalforge/server/modules/copy-trading/controller
 */

import { CopyTradingService } from './copy-trading.service.js';
import {
  validateSubscriptionPayload,
  validateSubscriptionUpdatePayload,
  validateFanOutPayload,
} from './copy-trading.validator.js';
import { ValidationError } from '../../lib/errors/validation-error.js';

export class CopyTradingController {
  constructor(service = null) {
    this.service = service || new CopyTradingService();
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

  subscribe = async (req, res, next) => {
    try {
      this.validateOrThrow(validateSubscriptionPayload, req.body);
      const subscription = await this.service.subscribe(req.user.id, req.body);
      res.status(201).json({ subscription });
    } catch (error) {
      next(error);
    }
  };

  listSubscriptions = async (req, res, next) => {
    try {
      const filters = {
        status: req.query.status,
        providerId: req.query.providerId,
      };
      const subscriptions = await this.service.listSubscriptions(req.user.id, filters);
      res.status(200).json({ subscriptions });
    } catch (error) {
      next(error);
    }
  };

  getSubscription = async (req, res, next) => {
    try {
      const subscription = await this.service.getSubscriptionById(req.params.subscriptionId);
      res.status(200).json({ subscription });
    } catch (error) {
      next(error);
    }
  };

  updateSubscription = async (req, res, next) => {
    try {
      this.validateOrThrow(validateSubscriptionUpdatePayload, req.body);
      const subscription = await this.service.updateSubscription(
        req.params.subscriptionId,
        req.body,
      );
      res.status(200).json({ subscription });
    } catch (error) {
      next(error);
    }
  };

  unsubscribe = async (req, res, next) => {
    try {
      const result = await this.service.unsubscribe(
        req.params.subscriptionId,
        req.user.id,
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  pauseSubscription = async (req, res, next) => {
    try {
      const subscription = await this.service.pauseSubscription(req.params.subscriptionId);
      res.status(200).json({ subscription });
    } catch (error) {
      next(error);
    }
  };

  resumeSubscription = async (req, res, next) => {
    try {
      const subscription = await this.service.resumeSubscription(req.params.subscriptionId);
      res.status(200).json({ subscription });
    } catch (error) {
      next(error);
    }
  };

  fanOut = async (req, res, next) => {
    try {
      this.validateOrThrow(validateFanOutPayload, req.body);
      const result = await this.service.fanOutSignal({
        ...req.body.signal,
        providerId: req.body.providerId,
      }, req.body.options || {});
      res.status(200).json({ fanOut: result });
    } catch (error) {
      next(error);
    }
  };

  getMetrics = async (req, res, next) => {
    try {
      const metrics = await this.service.getFanOutMetrics();
      res.status(200).json({ metrics });
    } catch (error) {
      next(error);
    }
  };

  listBatches = async (req, res, next) => {
    try {
      const batches = await this.service.listFanOutBatches(req.params.signalId);
      res.status(200).json({ batches });
    } catch (error) {
      next(error);
    }
  };

  listRecords = async (req, res, next) => {
    try {
      const records = await this.service.listFanOutRecords(req.params.batchId);
      res.status(200).json({ records });
    } catch (error) {
      next(error);
    }
  };

  fanOutStatus = async (req, res, next) => {
    try {
      const counts = await this.service.countFanOutByStatus(req.params.signalId);
      res.status(200).json({ counts });
    } catch (error) {
      next(error);
    }
  };

  syncProviderClose = async (req, res, next) => {
    try {
      const result = await this.service.syncProviderClose(
        req.params.providerTradeId,
        req.body.reason || 'PROVIDER_CLOSE',
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getLatencySummary = async (req, res, next) => {
    try {
      const summary = this.service.getLatencySummary();
      res.status(200).json({ summary });
    } catch (error) {
      next(error);
    }
  };

  reconcile = async (req, res, next) => {
    try {
      const result = await this.service.reconcileSubscriber(
        req.user.id,
        req.body.providerId || null,
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}

export default CopyTradingController;