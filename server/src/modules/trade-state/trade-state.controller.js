/**
 * Trade State Controller
 *
 * @module signalforge/server/modules/trade-state/controller
 */

import { TradeStateService } from './trade-state.service.js';

export class TradeStateController {
  constructor(service = null) {
    this.service = service || new TradeStateService();
  }

  createTrade = async (req, res, next) => {
    try {
      const trade = await this.service.createTrade({
        ...req.body,
        userId: req.body.userId || req.user.id,
      });
      res.status(201).json({ trade });
    } catch (error) {
      next(error);
    }
  };

  getTrade = async (req, res, next) => {
    try {
      const trade = await this.service.getById(req.params.tradeId);
      res.status(200).json({ trade });
    } catch (error) {
      next(error);
    }
  };

  getBySignalId = async (req, res, next) => {
    try {
      const trade = await this.service.getBySignalId(req.params.signalId);
      res.status(200).json({ trade });
    } catch (error) {
      next(error);
    }
  };

  updateTrade = async (req, res, next) => {
    try {
      const trade = await this.service.updateTrade(req.params.tradeId, req.body);
      res.status(200).json({ trade });
    } catch (error) {
      next(error);
    }
  };

  transitionState = async (req, res, next) => {
    try {
      const result = await this.service.transitionState(req.params.tradeId, req.body.eventType, {
        actor: req.body.actor,
        actorId: req.user.id,
        newState: req.body.newState,
        payload: req.body.payload,
        metadata: req.body.metadata,
      });
      res.status(200).json({ transition: result });
    } catch (error) {
      next(error);
    }
  };

  closeTrade = async (req, res, next) => {
    try {
      const trade = await this.service.closeTrade(req.params.tradeId, req.body);
      res.status(200).json({ trade });
    } catch (error) {
      next(error);
    }
  };

  archiveTrade = async (req, res, next) => {
    try {
      const trade = await this.service.archiveTrade(req.params.tradeId);
      res.status(200).json({ trade });
    } catch (error) {
      next(error);
    }
  };

  listTrades = async (req, res, next) => {
    try {
      const filters = {
        userId: req.query.userId || req.user.id,
        brokerAccountId: req.query.brokerAccountId,
        providerId: req.query.providerId,
        symbol: req.query.symbol,
        status: req.query.status,
        since: req.query.since,
      };
      const pagination = {
        limit: req.query.limit,
        offset: req.query.offset,
      };
      const result = await this.service.listTrades(filters, pagination);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  listTradeEvents = async (req, res, next) => {
    try {
      const filters = {
        eventType: req.query.eventType,
        actor: req.query.actor,
        severity: req.query.severity,
      };
      const pagination = {
        limit: req.query.limit,
        offset: req.query.offset,
      };
      const result = await this.service.getTradeEvents(
        req.params.tradeId,
        filters,
        pagination,
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  listUserEvents = async (req, res, next) => {
    try {
      const filters = {
        eventType: req.query.eventType,
        severity: req.query.severity,
        since: req.query.since,
      };
      const pagination = {
        limit: req.query.limit,
        offset: req.query.offset,
      };
      const result = await this.service.getUserEvents(req.user.id, filters, pagination);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getEventCounts = async (req, res, next) => {
    try {
      const counts = await this.service.getEventCounts(req.params.tradeId);
      res.status(200).json({ counts });
    } catch (error) {
      next(error);
    }
  };

  getStatusCounts = async (req, res, next) => {
    try {
      const filters = {
        userId: req.query.userId,
        since: req.query.since,
      };
      const counts = await this.service.getStatusCounts(filters);
      res.status(200).json({ counts });
    } catch (error) {
      next(error);
    }
  };

  getAllowedTransitions = async (req, res, next) => {
    try {
      const transitions = await this.service.getAllowedTransitions(req.params.tradeId);
      res.status(200).json({ transitions });
    } catch (error) {
      next(error);
    }
  };

  isTerminal = async (req, res, next) => {
    try {
      const terminal = await this.service.isTerminal(req.params.tradeId);
      res.status(200).json({ terminal });
    } catch (error) {
      next(error);
    }
  };
}

export default TradeStateController;