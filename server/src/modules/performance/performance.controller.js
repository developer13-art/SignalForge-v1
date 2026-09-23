/**
 * Performance Controller
 *
 * @module signalforge/server/modules/performance/controller
 */

import { PerformanceService } from './performance.service.js';

export class PerformanceController {
  constructor(service = null) {
    this.service = service || new PerformanceService();
  }

  openPeriod = async (req, res, next) => {
    try {
      const period = await this.service.openPeriod(req.user.id, req.body);
      res.status(201).json({ period });
    } catch (error) {
      next(error);
    }
  };

  ensureCurrentPeriod = async (req, res, next) => {
    try {
      const period = await this.service.ensureCurrentPeriod(
        req.user.id,
        req.body.brokerAccountId || null,
        { openingBalance: req.body.openingBalance },
      );
      res.status(200).json({ period });
    } catch (error) {
      next(error);
    }
  };

  listPeriods = async (req, res, next) => {
    try {
      const filters = {
        brokerAccountId: req.query.brokerAccountId,
        status: req.query.status,
        periodType: req.query.periodType,
        fromPeriod: req.query.fromPeriod,
        toPeriod: req.query.toPeriod,
      };
      const pagination = { limit: req.query.limit, offset: req.query.offset };
      const result = await this.service.listPeriods(req.user.id, filters, pagination);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getPeriod = async (req, res, next) => {
    try {
      const period = await this.service.getPeriod(req.user.id, req.params.periodId);
      res.status(200).json({ period });
    } catch (error) {
      next(error);
    }
  };

  updatePeriod = async (req, res, next) => {
    try {
      const period = await this.service.updatePeriod(
        req.user.id,
        req.params.periodId,
        req.body,
      );
      res.status(200).json({ period });
    } catch (error) {
      next(error);
    }
  };

  calculatePeriod = async (req, res, next) => {
    try {
      const calculation = await this.service.calculatePeriod(
        req.user.id,
        req.params.periodId,
      );
      res.status(200).json({ calculation });
    } catch (error) {
      next(error);
    }
  };

  freezePeriod = async (req, res, next) => {
    try {
      const result = await this.service.freezePeriod(req.user.id, req.params.periodId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  closePeriod = async (req, res, next) => {
    try {
      const result = await this.service.closePeriod(
        req.user.id,
        req.params.periodId,
        req.body || {},
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getMetrics = async (req, res, next) => {
    try {
      const metrics = await this.service.getMetrics(req.params.periodId);
      res.status(200).json({ metrics });
    } catch (error) {
      next(error);
    }
  };

  getEligibleNetProfit = async (req, res, next) => {
    try {
      const value = await this.service.getEligibleNetProfit(req.params.periodId);
      res.status(200).json({ eligibleNetProfit: value });
    } catch (error) {
      next(error);
    }
  };

  captureEquitySnapshot = async (req, res, next) => {
    try {
      const snapshot = await this.service.captureEquitySnapshot({
        ...req.body,
        userId: req.user.id,
      });
      res.status(201).json({ snapshot });
    } catch (error) {
      next(error);
    }
  };

  listEquitySnapshots = async (req, res, next) => {
    try {
      const filters = {
        brokerAccountId: req.query.brokerAccountId,
        periodId: req.query.periodId,
        since: req.query.since,
        until: req.query.until,
      };
      const pagination = { limit: req.query.limit, offset: req.query.offset };
      const result = await this.service.listEquitySnapshots(
        req.user.id,
        filters,
        pagination,
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getLatestEquitySnapshot = async (req, res, next) => {
    try {
      const snapshot = await this.service.getLatestEquitySnapshot(
        req.user.id,
        req.query.brokerAccountId || null,
      );
      res.status(200).json({ snapshot });
    } catch (error) {
      next(error);
    }
  };

  reconstructEquityCurve = async (req, res, next) => {
    try {
      const curve = await this.service.reconstructEquityCurve(
        req.user.id,
        req.params.periodId,
      );
      res.status(200).json({ curve });
    } catch (error) {
      next(error);
    }
  };

  getSettlementForPeriod = async (req, res, next) => {
    try {
      const settlement = await this.service.getSettlementForPeriod(
        req.user.id,
        req.params.settlementPeriod,
      );
      res.status(200).json({ settlement });
    } catch (error) {
      next(error);
    }
  };
}

export default PerformanceController;