/**
 * Admin Routes
 *
 * Express routes for the admin console. All routes require
 * authentication and admin authorization.
 *
 * @module server/modules/admin/admin.routes
 */

import { Router } from 'express';
import { adminController } from './admin.controller';
import { authenticationMiddleware } from '../../middleware/authentication.middleware';
import { authorizationMiddleware } from '../../middleware/authorization.middleware';
import { asyncHandler } from '../../lib/async-handler';

import adminUserRoutes from './users/admin-user.routes';
import adminProviderRoutes from './providers/admin-provider.routes';
import adminSignalRoutes from './signals/admin-signal.routes';
import adminTradeRoutes from './trades/admin-trade.routes';
import adminBrokerRoutes from './brokers/admin-broker.routes';
import adminKycRoutes from './kyc/admin-kyc.routes';
import adminMarketplaceRoutes from './marketplace/admin-marketplace.routes';
import adminReferralRoutes from './referrals/admin-referral.routes';
import adminSubscriptionRoutes from './subscriptions/admin-subscription.routes';
import adminPaymentRoutes from './payments/admin-payment.routes';
import adminWithdrawalRoutes from './withdrawals/admin-withdrawal.routes';
import adminAffiliateRoutes from './affiliate/admin-affiliate.routes';
import adminSystemRoutes from './system/system.routes';
import adminReportRoutes from './reports/admin-report.routes';

const router = Router();

router.use(authenticationMiddleware);
router.use(authorizationMiddleware(['ADMIN', 'SUPER_ADMIN']));

router.get(
  '/overview',
  asyncHandler(adminController.getPlatformOverview),
);

router.get(
  '/actions',
  asyncHandler(adminController.listAdminActions),
);

router.get(
  '/health',
  asyncHandler(adminController.getSystemHealth),
);

router.use('/users', adminUserRoutes);
router.use('/providers', adminProviderRoutes);
router.use('/signals', adminSignalRoutes);
router.use('/trades', adminTradeRoutes);
router.use('/brokers', adminBrokerRoutes);
router.use('/kyc', adminKycRoutes);
router.use('/marketplace', adminMarketplaceRoutes);
router.use('/referrals', adminReferralRoutes);
router.use('/subscriptions', adminSubscriptionRoutes);
router.use('/payments', adminPaymentRoutes);
router.use('/withdrawals', adminWithdrawalRoutes);
router.use('/affiliate', adminAffiliateRoutes);
router.use('/system', adminSystemRoutes);
router.use('/reports', adminReportRoutes);

export default router;