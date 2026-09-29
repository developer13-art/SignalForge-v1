/**
 * Admin Routes
 *
 * Express routes for the admin console. All routes require
 * authentication and admin authorization.
 *
 * @module server/modules/admin/admin.routes
 */
const { Router } = require('express');
const { adminController } = require('./admin.controller');
const { authenticationMiddleware } = require('../../middleware/authentication.middleware');
const { authorizationMiddleware } = require('../../middleware/authorization.middleware');
const { asyncHandler } = require('../../lib/async-handler');
const adminUserRoutes = require('./users/admin-user.routes');
const adminProviderRoutes = require('./providers/admin-provider.routes');
const adminSignalRoutes = require('./signals/admin-signal.routes');
const adminTradeRoutes = require('./trades/admin-trade.routes');
const adminBrokerRoutes = require('./brokers/admin-broker.routes');
const adminKycRoutes = require('./kyc/admin-kyc.routes');
const adminMarketplaceRoutes = require('./marketplace/admin-marketplace.routes');
const adminReferralRoutes = require('./referrals/admin-referral.routes');
const adminSubscriptionRoutes = require('./subscriptions/admin-subscription.routes');
const adminPaymentRoutes = require('./payments/admin-payment.routes');
const adminWithdrawalRoutes = require('./withdrawals/admin-withdrawal.routes');
const adminAffiliateRoutes = require('./affiliate/admin-affiliate.routes');
const adminSystemRoutes = require('./system/system.routes');
const adminReportRoutes = require('./reports/admin-report.routes');

const router = Router();

router.use(authenticationMiddleware());
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
module.exports = router;