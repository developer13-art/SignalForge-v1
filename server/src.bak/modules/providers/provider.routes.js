/**
 * Provider Routes
 *
 * @module signalforge/server/modules/providers/routes
 */

import { Router } from 'express';

import { ProviderController } from './provider.controller.js';
import { authenticationMiddleware } from '../../middleware/authentication.middleware.js';
import { requireAdminMiddleware } from '../../middleware/require-admin.middleware.js';

export function buildProviderRouter(controller = null) {
  const router = Router();
  const providerController = controller || new ProviderController();

  router.get('/providers', providerController.listPublicProviders);
  router.get('/providers/slug/:slug', providerController.getProfileBySlug);
  router.get('/providers/:providerId', providerController.getProvider);

  router.use(authenticationMiddleware());

  router.post('/providers', providerController.register);
  router.get('/providers/me/profile', providerController.getMyProfile);
  router.patch('/providers/:providerId', providerController.updateProvider);
  router.patch('/providers/:providerId/profile', providerController.updateMyProfile);
  router.post('/providers/:providerId/profile/avatar', providerController.updateAvatar);
  router.delete('/providers/:providerId/profile/avatar', providerController.removeAvatar);

  router.get('/providers/:providerId/dashboard/revenue', providerController.getRevenueDashboard);
  router.get('/providers/:providerId/revenue', providerController.listRevenue);
  router.get('/providers/:providerId/revenue/summary', providerController.getRevenueSummary);
  router.post('/providers/:providerId/revenue', providerController.recordRevenue);

  router.get('/providers/:providerId/subscribers', providerController.listSubscribers);
  router.post('/providers/:providerId/subscribers', providerController.addSubscriber);
  router.delete(
    '/providers/:providerId/subscribers/:subscriberId',
    providerController.removeSubscriber,
  );

  router.get('/providers/:providerId/promotions', providerController.listPromotions);
  router.post('/providers/:providerId/promotions', providerController.createPromotion);
  router.patch(
    '/providers/:providerId/promotions/:promotionId',
    providerController.updatePromotion,
  );
  router.delete(
    '/providers/:providerId/promotions/:promotionId',
    providerController.deletePromotion,
  );

  router.get('/providers/marketing/templates', providerController.getMarketingTemplates);
  router.get('/providers/:providerId/settings', providerController.getSettings);
  router.patch('/providers/:providerId/settings', providerController.updateSettings);

  router.post(
    '/providers/:providerId/certifications',
    providerController.startCertification,
  );
  router.get(
    '/providers/:providerId/certifications/latest',
    providerController.getLatestCertification,
  );
  router.get(
    '/providers/:providerId/certifications',
    providerController.listCertifications,
  );
  router.get(
    '/certifications/:certificationId',
    providerController.getCertification,
  );
  router.post(
    '/certifications/:certificationId/revoke',
    requireAdminMiddleware(),
    providerController.revokeCertification,
  );

  router.post(
    '/admin/providers/:providerId/approve',
    requireAdminMiddleware(),
    providerController.approveProvider,
  );
  router.post(
    '/admin/providers/:providerId/suspend',
    requireAdminMiddleware(),
    providerController.suspendProvider,
  );
  router.post(
    '/admin/providers/:providerId/reinstate',
    requireAdminMiddleware(),
    providerController.reinstateProvider,
  );
  router.get(
    '/admin/providers/stats',
    requireAdminMiddleware(),
    providerController.getStats,
  );
  router.post(
    '/admin/certifications/expire-due',
    requireAdminMiddleware(),
    providerController.expireDueCertifications,
  );

  return router;
}

export default buildProviderRouter;