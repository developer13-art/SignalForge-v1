/**
 * Certification Routes
 *
 * @module signalforge/server/modules/providers/certification/routes
 */
const { Router } = require('express');
const { CertificationController } = require('./controller.js');
const { authenticationMiddleware } = require('../../../middleware/authentication.middleware.js');
const { requireAdminMiddleware } = require('../../../middleware/require-admin.middleware.js');
function buildCertificationRouter(controller = null) {
  const router = Router();
  const certificationController = controller || new CertificationController();

  router.use(authenticationMiddleware());

  router.post(
    '/providers/:providerId/certifications',
    certificationController.startCertification,
  );
  router.get(
    '/providers/:providerId/certifications/latest',
    certificationController.getLatestCertification,
  );
  router.get(
    '/providers/:providerId/certifications',
    certificationController.listCertifications,
  );
  router.get(
    '/certifications/:certificationId',
    certificationController.getCertification,
  );
  router.post(
    '/certifications/:certificationId/revoke',
    requireAdminMiddleware(),
    certificationController.revokeCertification,
  );

  router.post(
    '/admin/certifications/expire-due',
    requireAdminMiddleware(),
    certificationController.expireDue,
  );

  return router;
}
module.exports = buildCertificationRouter;
module.exports.buildCertificationRouter = buildCertificationRouter;
