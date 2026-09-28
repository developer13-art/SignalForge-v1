/**
 * Performance Routes
 *
 * @module signalforge/server/modules/performance/routes
 */

import { Router } from 'express';

import { PerformanceController } from './performance.controller.js';
import { authenticationMiddleware } from '../../middleware/authentication.middleware.js';
import { requireAdminMiddleware } from '../../middleware/require-admin.middleware.js';

export function buildPerformanceRouter(controller = null) {
  const router = Router();
  const performanceController = controller || new PerformanceController();

  router.use(authenticationMiddleware());

  router.post('/periods', performanceController.openPeriod);
  router.post('/periods/ensure-current', performanceController.ensureCurrentPeriod);
  router.get('/periods', performanceController.listPeriods);
  router.get('/periods/:periodId', performanceController.getPeriod);
  router.patch('/periods/:periodId', performanceController.updatePeriod);
  router.post('/periods/:periodId/calculate', performanceController.calculatePeriod);
  router.post('/periods/:periodId/freeze', performanceController.freezePeriod);
  router.post('/periods/:periodId/close', performanceController.closePeriod);
  router.get('/periods/:periodId/metrics', performanceController.getMetrics);
  router.get(
    '/periods/:periodId/eligible-net-profit',
    performanceController.getEligibleNetProfit,
  );
  router.get(
    '/periods/:periodId/equity-curve',
    performanceController.reconstructEquityCurve,
  );

  router.post('/equity-snapshots', performanceController.captureEquitySnapshot);
  router.get('/equity-snapshots', performanceController.listEquitySnapshots);
  router.get(
    '/equity-snapshots/latest',
    performanceController.getLatestEquitySnapshot,
  );

  router.get(
    '/settlements/:settlementPeriod',
    performanceController.getSettlementForPeriod,
  );

  router.post(
    '/admin/freeze-due',
    requireAdminMiddleware(),
    async (req, res, next) => {
      try {
        const result = await performanceController.service.freezeDuePeriods();
        res.status(200).json(result);
      } catch (error) {
        next(error);
      }
    },
  );

  router.post(
    '/admin/close-due',
    requireAdminMiddleware(),
    async (req, res, next) => {
      try {
        const graceHours = req.body?.graceHours;
        const result = await performanceController.service.closeDuePeriods(graceHours);
        res.status(200).json(result);
      } catch (error) {
        next(error);
      }
    },
  );

  return router;
}

export default buildPerformanceRouter;