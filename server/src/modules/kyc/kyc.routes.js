/**
 * KYC Routes (module-level)
 *
 * @module signalforge/server/modules/kyc/routes
 */
const { Router } = require('express');
const multer = require('multer');
const { KycController } = require('./kyc.controller.js');
const { authenticationMiddleware } = require('../../middleware/authentication.middleware.js');
const { requireAdminMiddleware } = require('../../middleware/require-admin.middleware.js');
const { requireComplianceMiddleware } = require('../../middleware/require-compliance.middleware.js');
function buildKycRouter(controller = null) {
  const router = Router();
  const kycController = controller || new KycController();
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
  });

  router.get('/document-types', kycController.listDocumentTypes);

  router.use(authenticationMiddleware());

  router.get('/status', kycController.getStatus);
  router.get('/applications/me', kycController.getMyApplication);
  router.post('/applications', kycController.getOrCreateApplication);
  router.post('/applications/personal-info', kycController.updatePersonalInfo);
  router.patch('/applications/:applicationId/document-type', kycController.updateDocumentType);
  router.post('/applications/submit', kycController.submitApplication);
  router.post('/applications/resubmit', kycController.resubmitApplication);

  router.post('/documents', upload.single('document'), kycController.uploadDocument);
  router.get('/documents', kycController.listDocuments);
  router.get('/documents/:documentId', kycController.getDocument);
  router.get('/documents/:documentId/url', kycController.getDocumentUrl);
  router.delete('/documents/:documentId', kycController.deleteDocument);

  router.post('/selfie', upload.single('selfie'), kycController.uploadSelfie);

  router.post('/applications/:applicationId/personal-info', kycController.updatePersonalInfo);
  router.post('/applications/:applicationId/documents', upload.single('document'), kycController.uploadDocument);
  router.get('/applications/:applicationId/documents', kycController.listDocuments);
  router.get('/applications/:applicationId/documents/:documentId/url', kycController.getDocumentUrl);
  router.get('/applications/:applicationId/documents/:documentId', kycController.getDocument);
  router.delete('/applications/:applicationId/documents/:documentId', kycController.deleteDocument);
  router.post('/applications/:applicationId/selfie', upload.single('selfie'), kycController.uploadSelfie);
  router.post('/applications/:applicationId/submit', kycController.submitApplication);
  router.post('/applications/:applicationId/resubmit', kycController.resubmitApplication);
  router.get('/applications/:applicationId/verification', kycController.getLatestVerification);

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
module.exports = buildKycRouter;
module.exports.buildKycRouter = buildKycRouter;
