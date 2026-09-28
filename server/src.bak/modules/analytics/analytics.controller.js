/**
 * Analytics Controller
 *
 * @module signalforge/server/modules/analytics/controller
 */

import { AnalyticsService } from './analytics.service.js';
import { ReportController } from './reports/report.controller.js';
import { METRIC_TYPES } from './analytics.constants.js';

export class AnalyticsController {
  constructor(service = null) {
    this.service = service || new AnalyticsService();
    this.reportController = new ReportController(this.service.reports);
  }

  buildFilters = (req) => ({
    dateRange: req.query.dateRange,
    since: req.query.since,
    until: req.query.until,
    brokerAccountId: req.query.brokerAccountId,
    providerId: req.query.providerId,
    symbol: req.query.symbol,
    direction: req.query.direction,
    status: req.query.status,
  });

  getOverview = async (req, res, next) => {
    try {
      const overview = await this.service.getOverview(req.user.id, this.buildFilters(req));
      res.status(200).json({ overview });
    } catch (error) {
      next(error);
    }
  };

  getEquityCurve = async (req, res, next) => {
    try {
      const result = await this.service.getEquityCurve(req.user.id, this.buildFilters(req), {
        startingEquity: Number(req.query.startingEquity) || 0,
        maxPoints: Number(req.query.maxPoints) || undefined,
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getDrawdown = async (req, res, next) => {
    try {
      const result = await this.service.getDrawdown(req.user.id, this.buildFilters(req));
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getWinRate = async (req, res, next) => {
    try {
      const result = await this.service.getWinRate(req.user.id, this.buildFilters(req));
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getProfitFactor = async (req, res, next) => {
    try {
      const result = await this.service.getProfitFactor(req.user.id, this.buildFilters(req));
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getAverageRr = async (req, res, next) => {
    try {
      const result = await this.service.getAverageRr(req.user.id, this.buildFilters(req));
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getSharpeRatio = async (req, res, next) => {
    try {
      const result = await this.service.getSharpeRatio(req.user.id, this.buildFilters(req));
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getSortinoRatio = async (req, res, next) => {
    try {
      const result = await this.service.getSortinoRatio(req.user.id, this.buildFilters(req));
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getExecutionLatency = async (req, res, next) => {
    try {
      const result = await this.service.getExecutionLatency(req.user.id, this.buildFilters(req));
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getSymbolPerformance = async (req, res, next) => {
    try {
      const result = await this.service.getSymbolPerformance(req.user.id, this.buildFilters(req));
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getBehaviorAnalysis = async (req, res, next) => {
    try {
      const result = await this.service.getBehaviorAnalysis(req.user.id, this.buildFilters(req));
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getTradingCalendar = async (req, res, next) => {
    try {
      const result = await this.service.getTradingCalendar(req.user.id, this.buildFilters(req));
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getHeatmapByDay = async (req, res, next) => {
    try {
      const result = await this.service.getHeatmapByDay(req.user.id, this.buildFilters(req));
      res.status(200).json({ heatmap: result });
    } catch (error) {
      next(error);
    }
  };

  getHeatmapBySymbol = async (req, res, next) => {
    try {
      const result = await this.service.getHeatmapBySymbol(req.user.id, this.buildFilters(req));
      res.status(200).json({ heatmap: result });
    } catch (error) {
      next(error);
    }
  };

  getMetrics = async (req, res, next) => {
    try {
      const requested = req.query.metrics
        ? String(req.query.metrics).split(',').map((m) => m.trim())
        : Object.values(METRIC_TYPES);
      const results = await this.service.getBatchMetrics(
        req.user.id,
        requested,
        this.buildFilters(req),
      );
      res.status(200).json({ metrics: results });
    } catch (error) {
      next(error);
    }
  };

  requestReport = async (req, res, next) => {
    return this.reportController.requestReport(req, res, next);
  };

  listReports = async (req, res, next) => {
    return this.reportController.listReports(req, res, next);
  };

  getReport = async (req, res, next) => {
    return this.reportController.getReport(req, res, next);
  };

  exportReport = async (req, res, next) => {
    return this.reportController.exportReport(req, res, next);
  };

  deleteReport = async (req, res, next) => {
    return this.reportController.deleteReport(req, res, next);
  };
}

export default AnalyticsController;