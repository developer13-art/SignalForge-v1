/**
 * Trade Shadow Controller
 *
 * @module signalforge/server/modules/trade-shadow/controller
 */

import { ShadowService } from './shadow.service.js';

export class ShadowController {
  constructor(service = null) {
    this.service = service || new ShadowService();
  }

  compareTrades = async (req, res, next) => {
    try {
      const shadow = await this.service.compareTrades(
        req.user.id,
        req.body.providerTradeId,
        req.body.userTradeId,
        req.body.options || {},
      );
      res.status(201).json({ shadow });
    } catch (error) {
      next(error);
    }
  };

  getShadow = async (req, res, next) => {
    try {
      const shadow = await this.service.getById(req.params.shadowId);
      res.status(200).json({ shadow });
    } catch (error) {
      next(error);
    }
  };

  getByUserTrade = async (req, res, next) => {
    try {
      const shadow = await this.service.getByUserTrade(req.params.userTradeId);
      res.status(200).json({ shadow });
    } catch (error) {
      next(error);
    }
  };

  listByProviderTrade = async (req, res, next) => {
    try {
      const shadows = await this.service.listByProviderTrade(req.params.providerTradeId);
      res.status(200).json({ shadows });
    } catch (error) {
      next(error);
    }
  };

  listShadows = async (req, res, next) => {
    try {
      const filters = {
        outcome: req.query.outcome,
        divergenceType: req.query.divergenceType,
        behaviorCategory: req.query.behaviorCategory,
        since: req.query.since,
      };
      const pagination = {
        limit: req.query.limit,
        offset: req.query.offset,
      };
      const result = await this.service.listByUser(req.user.id, filters, pagination);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getInsights = async (req, res, next) => {
    try {
      const filters = { since: req.query.since };
      const insights = await this.service.getUserInsights(req.user.id, filters);
      res.status(200).json({ insights });
    } catch (error) {
      next(error);
    }
  };

  recomputeShadow = async (req, res, next) => {
    try {
      const shadow = await this.service.recomputeShadow(req.params.shadowId);
      res.status(200).json({ shadow });
    } catch (error) {
      next(error);
    }
  };
}

export default ShadowController;