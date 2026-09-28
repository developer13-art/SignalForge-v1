/**
 * Compliance Routes
 *
 * Express routes for the compliance console. All routes require
 * authentication and compliance officer (or admin) role.
 *
 * @module server/modules/compliance/compliance.routes
 */

import { Router } from 'express';
import { complianceController } from './compliance.controller';
import { authenticationMiddleware } from '../../middleware/authentication.middleware';
import { authorizationMiddleware } from '../../middleware/authorization.middleware';
import { asyncHandler } from '../../lib/async-handler';

import kycQueueRoutes from './kyc-queue/kyc-queue.routes';
import reviewRoutes from './review/review.routes';
import documentTypeRoutes from './document-types/document-type.routes';
import verificationProviderRoutes from './verification-providers/verification-provider.routes';
import riskFlagRoutes from './risk-flags/risk-flag.routes';
import auditRoutes from './audit/compliance-audit.routes';
import reportRoutes from './reports/compliance-report.routes';

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

export default router;