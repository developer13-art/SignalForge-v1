/**
 * Risk Controller
 *
 * @module signalforge/server/modules/risk/controller
 */

import { RiskService } from './risk.service.js';
import { RiskProfileController } from './profile/risk-profile.controller.js';

export class RiskController {
  constructor(service = null) {
    this.service = service || new RiskService();
    this.profileController = new RiskProfileController(this.service.profileService);
  }

  evaluate = async (req, res, next) => {
    try {
      const result = await this.service.evaluate(req.body.signal, {
        userId: req.user.id,
        brokerAccountId: req.body.brokerAccountId || null,
        accountSnapshot: req.body.accountSnapshot || null,
        recentTrades: req.body.recentTrades || null,
        requiredMargin: req.body.requiredMargin ?? null,
        currentSpread: req.body.currentSpread ?? null,
        estimatedSlippage: req.body.estimatedSlippage ?? null,
        referenceTime: req.body.referenceTime || null,
      });
      res.status(200).json({ decision: result });
    } catch (error) {
      next(error);
    }
  };

  getDecision = async (req, res, next) => {
    try {
      const decision = await this.service.getDecisionById(req.params.decisionId);
      res.status(200).json({ decision });
    } catch (error) {
      next(error);
    }
  };

  listDecisionsBySignal = async (req, res, next) => {
    try {
      const decisions = await this.service.listDecisionsBySignal(req.params.signalId);
      res.status(200).json({ decisions });
    } catch (error) {
      next(error);
    }
  };

  listDecisions = async (req, res, next) => {
    try {
      const filters = {
        userId: req.query.userId,
        decision: req.query.decision,
        since: req.query.since,
      };
      const pagination = {
        limit: req.query.limit,
        offset: req.query.offset,
      };
      const result = await this.service.listDecisions(filters, pagination);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  decisionStats = async (req, res, next) => {
    try {
      const filters = { since: req.query.since };
      const stats = await this.service.decisionStats(filters);
      res.status(200).json({ stats });
    } catch (error) {
      next(error);
    }
  };

  listRiskEvents = async (req, res, next) => {
    try {
      const filters = {
        userId: req.query.userId,
        severity: req.query.severity,
        eventType: req.query.eventType,
        since: req.query.since,
      };
      const pagination = {
        limit: req.query.limit,
        offset: req.query.offset,
      };
      const result = await this.service.listRiskEvents(filters, pagination);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  calculateLotSize = async (req, res, next) => {
    try {
      const result = this.service.calculateLotSize(req.body);
      res.status(200).json({ result });
    } catch (error) {
      next(error);
    }
  };

  calculatePositionSize = async (req, res, next) => {
    try {
      const result = this.service.calculatePositionSize(req.body);
      res.status(200).json({ result });
    } catch (error) {
      next(error);
    }
  };

  getProfile = async (req, res, next) => {
    return this.profileController.getProfile(req, res, next);
  };

  updateProfile = async (req, res, next) => {
    return this.profileController.updateProfile(req, res, next);
  };

  activateEmergencyStop = async (req, res, next) => {
    return this.profileController.activateEmergencyStop(req, res, next);
  };

  deactivateEmergencyStop = async (req, res, next) => {
    return this.profileController.deactivateEmergencyStop(req, res, next);
  };
}

export default RiskController;