/**
 * Report Routes
 *
 * @module signalforge/server/modules/analytics/reports/routes
 */

import { Router } from 'express';

import { ReportController } from './report.controller.js';
import { authenticationMiddleware } from '../../../middleware/authentication.middleware.js';

export function buildReportRouter(controller = null) {
  const router = Router();
  const reportController = controller || new ReportController();

  router.use(authenticationMiddleware());

  router.post('/reports', reportController.requestReport);
  router.get('/reports', reportController.listReports);
  router.get('/reports/:reportId', reportController.getReport);
  router.get('/reports/:reportId/export', reportController.exportReport);
  router.delete('/reports/:reportId', reportController.deleteReport);

  return router;
}

export default buildReportRouter;