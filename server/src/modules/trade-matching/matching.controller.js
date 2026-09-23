/**
 * Trade Matching Controller
 *
 * @module signalforge/server/modules/trade-matching/controller
 */

import { MatchingService } from './matching.service.js';

export class MatchingController {
  constructor(service = null) {
    this.service = service || new MatchingService();
  }

  matchTrade = async (req, res, next) => {
    try {
      const result = await this.service.matchTrade(req.body.signal, req.body.context || {});
      res.status(200).json({ match: result });
    } catch (error) {
      next(error);
    }
  };

  applyInstruction = async (req, res, next) => {
    try {
      const result = await this.service.applyManagementInstruction(
        req.body.signal,
        req.body.instruction,
        req.body.context || {},
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  classifyInstruction = async (req, res, next) => {
    try {
      const instruction = await this.service.classifyInstruction(req.body.text);
      res.status(200).json({ instruction });
    } catch (error) {
      next(error);
    }
  };

  listMatchesByTrade = async (req, res, next) => {
    try {
      const matches = await this.service.listMatchesByTrade(req.params.tradeId);
      res.status(200).json({ matches });
    } catch (error) {
      next(error);
    }
  };

  listMatchesBySignal = async (req, res, next) => {
    try {
      const matches = await this.service.listMatchesBySignal(req.params.signalId);
      res.status(200).json({ matches });
    } catch (error) {
      next(error);
    }
  };

  listOpenTrades = async (req, res, next) => {
    try {
      const filters = {
        symbol: req.query.symbol,
        providerId: req.query.providerId,
      };
      const trades = await this.service.listOpenTradesForUser(req.user.id, filters);
      res.status(200).json({ trades });
    } catch (error) {
      next(error);
    }
  };
}

export default MatchingController;