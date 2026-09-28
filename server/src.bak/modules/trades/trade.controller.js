/**
 * Trades Controller
 *
 * @module signalforge/server/modules/trades/controller
 */

import { TradeService } from './trade.service.js';
import {
  validateManualOpenPayload,
  validateManualClosePayload,
  validateManualModifyPayload,
  validateTradeListQuery,
} from './trade.validator.js';
import { ValidationError } from '../../lib/errors/validation-error.js';

export class TradeController {
  constructor(service = null) {
    this.service = service || new TradeService();
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

  listTrades = async (req, res, next) => {
    try {
      this.validateOrThrow(validateTradeListQuery, req.query);
      const filters = {
        brokerAccountId: req.query.brokerAccountId,
        providerId: req.query.providerId,
        symbol: req.query.symbol,
        direction: req.query.direction,
        status: req.query.status,
        since: req.query.since,
        until: req.query.until,
      };
      const pagination = {
        limit: req.query.limit,
        offset: req.query.offset,
      };
      const result = await this.service.listTrades(req.user.id, filters, pagination);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  listOpenPositions = async (req, res, next) => {
    try {
      const filters = {
        brokerAccountId: req.query.brokerAccountId,
        providerId: req.query.providerId,
        symbol: req.query.symbol,
      };
      const pagination = { limit: req.query.limit, offset: req.query.offset };
      const result = await this.service.listOpenPositions(req.user.id, filters, pagination);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  listPendingOrders = async (req, res, next) => {
    try {
      const filters = { brokerAccountId: req.query.brokerAccountId };
      const pagination = { limit: req.query.limit, offset: req.query.offset };
      const result = await this.service.listPendingOrders(req.user.id, filters, pagination);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  listClosedTrades = async (req, res, next) => {
    try {
      const filters = {
        brokerAccountId: req.query.brokerAccountId,
        providerId: req.query.providerId,
        symbol: req.query.symbol,
        since: req.query.since,
        until: req.query.until,
      };
      const pagination = { limit: req.query.limit, offset: req.query.offset };
      const result = await this.service.listClosedTrades(req.user.id, filters, pagination);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getHistory = async (req, res, next) => {
    try {
      const filters = {
        brokerAccountId: req.query.brokerAccountId,
        providerId: req.query.providerId,
        symbol: req.query.symbol,
        since: req.query.since,
        until: req.query.until,
      };
      const pagination = { limit: req.query.limit, offset: req.query.offset };
      const result = await this.service.getHistory(req.user.id, filters, pagination);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getHistorySummary = async (req, res, next) => {
    try {
      const filters = {
        since: req.query.since,
        until: req.query.until,
      };
      const summary = await this.service.getHistorySummary(req.user.id, filters);
      res.status(200).json({ summary });
    } catch (error) {
      next(error);
    }
  };

  getTrade = async (req, res, next) => {
    try {
      const options = {
        includeTimeline: req.query.includeTimeline === 'true',
        timelineFilters: {},
        timelinePagination: { limit: req.query.timelineLimit, offset: req.query.timelineOffset },
      };
      const result = await this.service.getTradeDetails(req.user.id, req.params.tradeId, options);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getStatusCounts = async (req, res, next) => {
    try {
      const filters = {
        since: req.query.since,
        brokerAccountId: req.query.brokerAccountId,
      };
      const counts = await this.service.getStatusCounts(req.user.id, filters);
      res.status(200).json({ counts });
    } catch (error) {
      next(error);
    }
  };

  getSymbolBreakdown = async (req, res, next) => {
    try {
      const filters = { since: req.query.since };
      const limit = Number(req.query.limit) || 50;
      const breakdown = await this.service.getSymbolBreakdown(req.user.id, filters, limit);
      res.status(200).json({ breakdown });
    } catch (error) {
      next(error);
    }
  };

  sumProfit = async (req, res, next) => {
    try {
      const filters = {
        since: req.query.since,
        until: req.query.until,
      };
      const summary = await this.service.sumRealizedProfit(req.user.id, filters);
      res.status(200).json({ summary });
    } catch (error) {
      next(error);
    }
  };

  openManualTrade = async (req, res, next) => {
    try {
      this.validateOrThrow(validateManualOpenPayload, req.body);
      const result = await this.service.openManualTrade(req.user.id, req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  closeManualTrade = async (req, res, next) => {
    try {
      this.validateOrThrow(validateManualClosePayload, req.body);
      const result = await this.service.closeManualTrade(req.user.id, req.params.tradeId, req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  modifyManualTrade = async (req, res, next) => {
    try {
      this.validateOrThrow(validateManualModifyPayload, req.body);
      const result = await this.service.modifyManualTrade(req.user.id, req.params.tradeId, req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  intervene = async (req, res, next) => {
    try {
      const result = await this.service.intervene(
        req.user.id,
        req.params.tradeId,
        req.body.action,
        req.body.payload || {},
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  closeAll = async (req, res, next) => {
    try {
      const filters = { brokerAccountId: req.body.brokerAccountId };
      const result = await this.service.closeAllTrades(req.user.id, filters);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  archiveTrade = async (req, res, next) => {
    try {
      const trade = await this.service.archiveTrade(req.user.id, req.params.tradeId);
      res.status(200).json({ trade });
    } catch (error) {
      next(error);
    }
  };

  getTimeline = async (req, res, next) => {
    try {
      const filters = { eventType: req.query.eventType, actor: req.query.actor };
      const pagination = { limit: req.query.limit, offset: req.query.offset };
      const timeline = await this.service.getTimeline(
        req.user.id,
        req.params.tradeId,
        filters,
        pagination,
      );
      res.status(200).json(timeline);
    } catch (error) {
      next(error);
    }
  };
}

export default TradeController;