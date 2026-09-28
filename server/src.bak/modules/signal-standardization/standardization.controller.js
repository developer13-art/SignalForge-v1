/**
 * Signal Standardization Controller
 *
 * @module signalforge/server/modules/signal-standardization/controller
 */

import { StandardizationService } from './standardization.service.js';

export class StandardizationController {
  constructor(service = null) {
    this.service = service || new StandardizationService();
  }

  standardize = async (req, res, next) => {
    try {
      const result = await this.service.standardize(req.body.signal || req.body, {
        providerId: req.body.providerId,
        sourceType: req.body.sourceType,
        sourceId: req.body.sourceId,
        rawMessageId: req.body.rawMessageId,
        channelId: req.body.channelId,
        originalText: req.body.originalText,
        context: req.body.context,
      });
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  getBySignalId = async (req, res, next) => {
    try {
      const signal = await this.service.getBySignalId(req.params.signalId);
      res.status(200).json({ signal });
    } catch (error) {
      next(error);
    }
  };

  getByRawMessageId = async (req, res, next) => {
    try {
      const signal = await this.service.getByRawMessageId(req.params.rawMessageId);
      res.status(200).json({ signal });
    } catch (error) {
      next(error);
    }
  };

  getByFingerprint = async (req, res, next) => {
    try {
      const signal = await this.service.getByFingerprint(req.params.fingerprint);
      res.status(200).json({ signal });
    } catch (error) {
      next(error);
    }
  };

  list = async (req, res, next) => {
    try {
      const filters = {
        providerId: req.query.providerId,
        sourceType: req.query.sourceType,
        symbol: req.query.symbol,
        direction: req.query.direction,
        classification: req.query.classification,
        minConfidence:
          req.query.minConfidence !== undefined ? Number(req.query.minConfidence) : undefined,
        since: req.query.since,
      };
      const pagination = {
        limit: req.query.limit,
        offset: req.query.offset,
      };
      const result = await this.service.list(filters, pagination);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  stats = async (req, res, next) => {
    try {
      const filters = {
        providerId: req.query.providerId,
        since: req.query.since,
      };
      const stats = await this.service.stats(filters);
      res.status(200).json({ stats });
    } catch (error) {
      next(error);
    }
  };

  updateStatus = async (req, res, next) => {
    try {
      const result = await this.service.updateStatus(req.params.signalId, req.body.status);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}

export default StandardizationController;