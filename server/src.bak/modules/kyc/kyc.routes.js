/**
 * KYC Routes (module-level)
 *
 * @module signalforge/server/modules/kyc/routes
 */

import { Router } from 'express';

import { KycController } from './kyc.controller.js';
import { authenticationMiddleware } from '../../middleware/authentication.middleware.js';
import { requireAdminMiddleware } from '../../middleware/require-admin.middleware.js';
import { requireComplianceMiddleware } from '../../middleware/require-compliance.middleware.js';

export function buildKycRouter(controller = null) {
  const router = Router();
  const kycController = controller || new KycController();

  router.get('/document-types', kycController.listDocumentTypes);

  router.use(authenticationMiddleware());

  router.get('/status', kycController.getStatus);
  router.get('/applications/me', kycController.getMyApplication);
  router.post('/applications', kycController.getOrCreateApplication);
  router.post('/applications/personal-info', kycController.updatePersonalInfo);
  router.post('/applications/submit', kycController.submitApplication);
  router.post('/applications/resubmit', kycController.resubmitApplication);

  router.post('/documents', kycController.uploadDocument);
  router.get('/documents', kycController.listDocuments);
  router.get('/documents/:documentId', kycController.getDocument);
  router.get('/documents/:documentId/url', kycController.getDocumentUrl);
  router.delete('/documents/:documentId', kycController.deleteDocument);

  router.post('/selfie', kycController.uploadSelfie);

  router.post('/verifications/start', kycController.startVerification);
  router.get('/verifications/latest', kycController.getLatestVerification);
  router.get('/verifications', kycController.listVerifications);

  router.get(
    '/applications/:applicationId',
    requireComplianceMiddleware(),
    kycController.getApplication,
  );
  router.get(
    '/applications/:applicationId/audit-logs',
    requireComplianceMiddleware(),
    kycController.listAuditLogs,
  );
  router.post(
    '/applications/:applicationId/approve',
    requireComplianceMiddleware(),
    kycController.approve,
  );
  router.post(
    '/applications/:applicationId/reject',
    requireComplianceMiddleware(),
    kycController.reject,
  );
  router.post(
    '/applications/:applicationId/request-resubmission',
    requireComplianceMiddleware(),
    kycController.requestResubmission,
  );

  router.get('/admin/applications', requireComplianceMiddleware(), kycController.listApplications);
  router.get('/admin/stats', requireComplianceMiddleware(), kycController.getStats);
  router.post(
    '/admin/users/:userId/reverify',
    requireAdminMiddleware(),
    kycController.triggerReverification,
  );

  router.post('/webhooks/:provider', kycController.handleProviderWebhook);

  return router;
}

export default buildKycRouter;