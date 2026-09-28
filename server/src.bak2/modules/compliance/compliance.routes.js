/**
 * Compliance Routes
 *
 * Express routes for the compliance console. All routes require
 * authentication and compliance officer (or admin) role.
 *
 * @module server/modules/compliance/compliance.routes
 */
const { Router } = require('express');
const { complianceController } = require('./compliance.controller');
const { authenticationMiddleware } = require('../../middleware/authentication.middleware');
const { authorizationMiddleware } = require('../../middleware/authorization.middleware');
const { asyncHandler } = require('../../lib/async-handler');
const kycQueueRoutes = require('./kyc-queue/kyc-queue.routes');
const reviewRoutes = require('./review/review.routes');
const documentTypeRoutes = require('./document-types/document-type.routes');
const verificationProviderRoutes = require('./verification-providers/verification-provider.routes');
const riskFlagRoutes = require('./risk-flags/risk-flag.routes');
const auditRoutes = require('./audit/compliance-audit.routes');
const reportRoutes = require('./reports/compliance-report.routes');

const router = Router();

router.use(authenticationMiddleware);
router.use(authorizationMiddleware(['COMPLIANCE_OFFICER', 'ADMIN', 'SUPER_ADMIN']));

router.get(
  '/dashboard',
  asyncHandler(complianceController.getDashboard),
);

router.get(
  '/sla-breaches',
  asyncHandler(complianceController.getSlaBreaches),
);

router.use('/queue', kycQueueRoutes);
router.use('/review', reviewRoutes);
router.use('/document-types', documentTypeRoutes);
router.use('/verification-providers', verificationProviderRoutes);
router.use('/risk-flags', riskFlagRoutes);
router.use('/audit', auditRoutes);
router.use('/reports', reportRoutes);
module.exports = router;