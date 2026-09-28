/**
 * Admin System Routes
 *
 * Express routes for administrative system operations including
 * settings, feature flags, and health checks.
 *
 * @module server/modules/admin/system/system.routes
 */

import { Router } from 'express';
import { asyncHandler } from '../../../lib/async-handler';
import { successResponse } from '../../../lib/response/success.response';
import { systemSettingsService } from './system-settings.service';
import { featureFlagService } from './feature-flag.service';
import { systemHealthService } from './system-health.service';

const router = Router();

router.get(
  '/settings',
  asyncHandler(async (req, res) => {
    const settings = await systemSettingsService.listSettings({ category: req.query.category });
    return successResponse(res, { settings });
  }),
);

router.get(
  '/settings/public',
  asyncHandler(async (req, res) => {
    const settings = await systemSettingsService.listPublicSettings();
    return successResponse(res, { settings });
  }),
);

router.get(
  '/settings/:key',
  asyncHandler(async (req, res) => {
    const value = await systemSettingsService.getSetting({ key: req.params.key });
    return successResponse(res, { key: req.params.key, value });
  }),
);

router.put(
  '/settings/:key',
  asyncHandler(async (req, res) => {
    const actorId = req.user.id;
    const { value, valueType, category, description, isPublic } = req.body || {};

    const result = await systemSettingsService.setSetting({
      key: req.params.key,
      value,
      valueType,
      category,
      description,
      isPublic,
      actorId,
    });

    return successResponse(res, { setting: result });
  }),
);

router.delete(
  '/settings/:key',
  asyncHandler(async (req, res) => {
    const actorId = req.user.id;
    const result = await systemSettingsService.deleteSetting({
      key: req.params.key,
      actorId,
    });
    return successResponse(res, result);
  }),
);

router.get(
  '/flags',
  asyncHandler(async (req, res) => {
    const flags = await featureFlagService.listFlags();
    return successResponse(res, { flags });
  }),
);

router.get(
  '/flags/:flagName',
  asyncHandler(async (req, res) => {
    const enabled = await featureFlagService.isFlagEnabled({
      flagName: req.params.flagName,
    });
    return successResponse(res, { flagName: req.params.flagName, enabled });
  }),
);

router.put(
  '/flags/:flagName',
  asyncHandler(async (req, res) => {
    const actorId = req.user.id;
    const { enabled, description } = req.body || {};

    const result = await featureFlagService.setFlag({
      flagName: req.params.flagName,
      enabled,
      description,
      actorId,
    });

    return successResponse(res, result);
  }),
);

router.get(
  '/health',
  asyncHandler(async (req, res) => {
    const health = await systemHealthService.checkSystemHealth();
    return successResponse(res, { health });
  }),
);

router.get(
  '/health/quick',
  asyncHandler(async (req, res) => {
    const status = await systemHealthService.getQuickHealthStatus();
    return successResponse(res, { status });
  }),
);

export default router;