/**
 * Referral Routes
 *
 * @module signalforge/server/modules/referrals/routes
 */

import { Router } from 'express';

import { ReferralController } from './referral.controller.js';
import { authenticationMiddleware } from '../../middleware/authentication.middleware.js';
import { requireAdminMiddleware } from '../../middleware/require-admin.middleware.js';

export function buildReferralRouter(controller = null) {
  const router = Router();
  const referralController = controller || new ReferralController();

  router.use(authenticationMiddleware());

  router.get('/referrals/code', referralController.getMyCode);
  router.post('/referrals/code', referralController.createCode);
  router.post('/referrals/code/regenerate', referralController.regenerateCode);
  router.get('/referrals/codes', referralController.listMyCodes);

  router.post('/referrals/relationship', referralController.createRelationship);
  router.get('/referrals/relationship/me', referralController.getMyRelationship);
  router.get('/referrals/relationships', referralController.listReferrals);

  router.get('/referrals/dashboard', referralController.getDashboard);
  router.get('/referrals/rewards', referralController.listRewards);
  router.get('/referrals/rewards/:rewardId', referralController.getReward);

  router.get('/referrals/wallet', referralController.getWallet);
  router.get('/referrals/ledger', referralController.listLedger);

  router.post(
    '/admin/referrals/settlements/run',
    requireAdminMiddleware(),
    referralController.adminRunSettlement,
  );
  router.post(
    '/admin/referrals/settlements/:settlementPeriod/finalize',
    requireAdminMiddleware(),
    referralController.adminFinalizeSettlement,
  );
  router.get(
    '/admin/referrals/settlements',
    requireAdminMiddleware(),
    referralController.adminListSettlements,
  );
  router.get(
    '/admin/referrals/settlements/:settlementId',
    requireAdminMiddleware(),
    referralController.adminGetSettlement,
  );
  router.get(
    '/admin/referrals/settlements/period/:settlementPeriod/rewards',
    requireAdminMiddleware(),
    referralController.adminListSettlementRewards,
  );

  router.post(
    '/admin/referrals/rewards/:rewardId/approve',
    requireAdminMiddleware(),
    referralController.adminApproveReward,
  );
  router.post(
    '/admin/referrals/rewards/:rewardId/reject',
    requireAdminMiddleware(),
    referralController.adminRejectReward,
  );
  router.post(
    '/admin/referrals/rewards/:rewardId/reverse',
    requireAdminMiddleware(),
    referralController.adminReverseReward,
  );

  router.get(
    '/admin/referrals/fraud/flags',
    requireAdminMiddleware(),
    referralController.adminListFraudFlags,
  );
  router.get(
    '/admin/referrals/fraud/open',
    requireAdminMiddleware(),
    referralController.adminListOpenFraudFlags,
  );
  router.post(
    '/admin/referrals/fraud/flags/:flagId/assign',
    requireAdminMiddleware(),
    referralController.adminAssignFraudFlag,
  );
  router.post(
    '/admin/referrals/fraud/flags/:flagId/resolve',
    requireAdminMiddleware(),
    referralController.adminResolveFraudFlag,
  );

  return router;
}

export default buildReferralRouter;