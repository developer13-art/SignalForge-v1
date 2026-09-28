/**
 * Security Routes
 *
 * Express routes for the security module. All routes require
 * authentication and admin authorization. API key sub-routes are
 * mounted by the main router.
 *
 * @module server/modules/security/security.routes
 */

import { Router } from 'express';
import { securityService } from './security.service';
import { authenticationMiddleware } from '../../middleware/authentication.middleware';
import { authorizationMiddleware } from '../../middleware/authorization.middleware';
import { asyncHandler } from '../../lib/async-handler';
import { successResponse } from '../../lib/response/success.response';
import { sessionMonitorService } from './session-monitor.service';
import { threatDetectionService } from './threat-detection.service';
import { apiKeyController } from './api-key.controller';

const router = Router();

router.use(authenticationMiddleware);

router.get(
  '/overview',
  authorizationMiddleware(['ADMIN', 'SUPER_ADMIN']),
  asyncHandler(async (req, res) => {
    const overview = await securityService.getSecurityOverview();
    return successResponse(res, { overview });
  }),
);

router.get(
  '/sessions',
  authorizationMiddleware(['ADMIN', 'SUPER_ADMIN']),
  asyncHandler(async (req, res) => {
    const sessions = await sessionMonitorService.listAllActiveSessions({
      limit: req.query.limit ? Number(req.query.limit) : 500,
    });
    return successResponse(res, { sessions });
  }),
);

router.post(
  '/sessions/revoke-all',
  authorizationMiddleware(['ADMIN', 'SUPER_ADMIN']),
  asyncHandler(async (req, res) => {
    const actorId = req.user.id;
    const { userId, reason } = req.body || {};
    const result = await sessionMonitorService.revokeAllSessions({
      userId,
      reason,
      actorId,
    });
    return successResponse(res, result);
  }),
);

router.get(
  '/threats',
  authorizationMiddleware(['ADMIN', 'SUPER_ADMIN']),
  asyncHandler(async (req, res) => {
    const threats = await threatDetectionService.listRecentThreats({
      limit: req.query.limit ? Number(req.query.limit) : 100,
      level: req.query.level,
    });
    return successResponse(res, { threats });
  }),
);

router.get(
  '/threats/summary',
  authorizationMiddleware(['ADMIN', 'SUPER_ADMIN']),
  asyncHandler(async (req, res) => {
    const summary = await threatDetectionService.getThreatSummary({
      windowDays: req.query.windowDays ? Number(req.query.windowDays) : 7,
    });
    return successResponse(res, { summary });
  }),
);

router.post(
  '/threats/:threatId/resolve',
  authorizationMiddleware(['ADMIN', 'SUPER_ADMIN']),
  asyncHandler(async (req, res) => {
    const resolvedBy = req.user.id;
    const { notes } = req.body || {};
    const result = await threatDetectionService.resolveThreat({
      threatId: req.params.threatId,
      resolvedBy,
      notes,
    });
    return successResponse(res, result);
  }),
);

router.get(
  '/blocked-ips',
  authorizationMiddleware(['ADMIN', 'SUPER_ADMIN']),
  asyncHandler(async (req, res) => {
    const ips = threatDetectionService.listBlockedIps();
    return successResponse(res, { ips });
  }),
);

router.post(
  '/blocked-ips/:ipAddress/unblock',
  authorizationMiddleware(['ADMIN', 'SUPER_ADMIN']),
  asyncHandler(async (req, res) => {
    const result = threatDetectionService.unblockIp({ ipAddress: req.params.ipAddress });
    return successResponse(res, result);
  }),
);

router.get(
  '/api-keys',
  asyncHandler(apiKeyController.listApiKeys),
);

router.post(
  '/api-keys',
  asyncHandler(apiKeyController.createApiKey),
);

router.post(
  '/api-keys/:apiKeyId/revoke',
  asyncHandler(apiKeyController.revokeApiKey),
);

router.delete(
  '/api-keys/:apiKeyId',
  asyncHandler(apiKeyController.deleteApiKey),
);

export default router;