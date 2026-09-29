/**
 * Audit Routes
 *
 * Express routes for the platform-wide audit log. All routes require
 * authentication and admin authorization.
 *
 * @module server/modules/audit/audit.routes
 */
const { Router } = require('express');
const { auditController } = require('./audit.controller');
const { authenticationMiddleware } = require('../../middleware/authentication.middleware');
const { authorizationMiddleware } = require('../../middleware/authorization.middleware');
const { asyncHandler } = require('../../lib/async-handler');

const router = Router();

router.use(authenticationMiddleware());
router.use(authorizationMiddleware(['ADMIN', 'SUPER_ADMIN', 'COMPLIANCE_OFFICER']));

router.get(
  '/',
  asyncHandler(auditController.listAuditEntries),
);

router.get(
  '/actions/summary',
  asyncHandler(auditController.getActionSummary),
);

router.get(
  '/severity/summary',
  asyncHandler(auditController.getSeveritySummary),
);

router.get(
  '/severity/recent',
  asyncHandler(auditController.getRecentHighSeverity),
);

router.get(
  '/correlation/:correlationId',
  asyncHandler(auditController.listByCorrelation),
);

router.get(
  '/resources/:resourceType/:resourceId',
  asyncHandler(auditController.listByResource),
);

router.get(
  '/actors/:actorId/activity',
  asyncHandler(auditController.getActorActivity),
);

router.get(
  '/:auditId',
  asyncHandler(auditController.getAuditEntry),
);
module.exports = router;