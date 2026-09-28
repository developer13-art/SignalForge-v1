/**
 * Verification Provider Routes
 *
 * @module server/modules/compliance/verification-providers/verification-provider.routes
 */

import { Router } from 'express';
import { verificationProviderService } from './verification-provider.service';
import { asyncHandler } from '../../../lib/async-handler';
import { successResponse } from '../../../lib/response/success.response';

const router = Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { activeOnly } = req.query;
    const providers = await verificationProviderService.listProviders({
      activeOnly: activeOnly !== 'false',
    });
    return successResponse(res, { providers });
  }),
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { code, label, type, config, active, priority } = req.body || {};

    const provider = await verificationProviderService.createProvider({
      code,
      label,
      type,
      config,
      active,
      priority,
    });

    return successResponse(res, { provider }, 201);
  }),
);

router.get(
  '/:providerId',
  asyncHandler(async (req, res) => {
    const provider = await verificationProviderService.getProviderById({
      providerId: req.params.providerId,
    });
    return successResponse(res, { provider });
  }),
);

router.patch(
  '/:providerId',
  asyncHandler(async (req, res) => {
    const { label, type, config, active, priority } = req.body || {};

    const provider = await verificationProviderService.updateProvider({
      providerId: req.params.providerId,
      label,
      type,
      config,
      active,
      priority,
    });

    return successResponse(res, { provider });
  }),
);

router.delete(
  '/:providerId',
  asyncHandler(async (req, res) => {
    const result = await verificationProviderService.deleteProvider({
      providerId: req.params.providerId,
    });
    return successResponse(res, result);
  }),
);

export default router;