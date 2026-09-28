/**
 * Analytics Routes
 *
 * @module signalforge/server/modules/analytics/routes
 */

import { Router } from 'express';

import { AnalyticsController } from './analytics.controller.js';
import { buildReportRouter } from './reports/report.routes.js';
import { authenticationMiddleware } from '../../middleware/authentication.middleware.js';

export function buildAnalyticsRouter(controller = null) {
  const router = Router();
  const analyticsController = controller || new AnalyticsController();

  router.use(authenticationMiddleware());

  router.get('/overview', analyticsController.getOverview);

  router.get('/equity-curve', analyticsController.getEquityCurve);
  router.get('/drawdown', analyticsController.getDrawdown);
  router.get('/win-rate', analyticsController.getWinRate);
  router.get('/profit-factor', analyticsController.getProfitFactor);
  router.get('/average-rr', analyticsController.getAverageRr);
  router.get('/sharpe-ratio', analyticsController.getSharpeRatio);
  router.get('/sortino-ratio', analyticsController.getSortinoRatio);
  router.get('/execution-latency', analyticsController.getExecutionLatency);
  router.get('/symbols/performance', analyticsController.getSymbolPerformance);
  router.get('/behavior-analysis', analyticsController.getBehaviorAnalysis);
  router.get('/calendar', analyticsController.getTradingCalendar);
  router.get('/heatmap/day', analyticsController.getHeatmapByDay);
  router.get('/heatmap/symbol', analyticsController.getHeatmapBySymbol);
  router.get('/metrics', analyticsController.getMetrics);

  router.use(buildReportRouter(analyticsController.reportController));

  return router;
}

export default buildAnalyticsRouter;