/**
 * Certification Routes
 *
 * @module signalforge/server/modules/providers/certification/routes
 */

import { Router } from 'express';

import { CertificationController } from './controller.js';
import { authenticationMiddleware } from '../../../middleware/authentication.middleware.js';
import { requireAdminMiddleware } from '../../../middleware/require-admin.middleware.js';

export function buildCertificationRouter(controller = null) {
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

export default buildCertificationRouter;