/**
 * Report Routes
 *
 * @module signalforge/server/modules/analytics/reports/routes
 */
const { Router } = require('express');
const { ReportController } = require('./report.controller.js');
const { authenticationMiddleware } = require('../../../middleware/authentication.middleware.js');
function buildReportRouter(controller = null) {
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
module.exports = buildReportRouter;
module.exports.buildReportRouter = buildReportRouter;
