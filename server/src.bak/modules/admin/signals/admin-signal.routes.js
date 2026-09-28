/**
 * Admin Signal Routes
 *
 * @module server/modules/admin/signals/admin-signal.routes
 */

import { Router } from 'express';
import { adminSignalMonitorService } from './admin-signal-monitor.service';
import { asyncHandler } from '../../../lib/async-handler';
import { successResponse } from '../../../lib/response/success.response';
import { paginatedResponse } from '../../../lib/response/paginated.response';

const router = Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { page, limit, status, providerId, symbol, from, to } = req.query;

    const result = await adminSignalMonitorService.listSignals({
      filters: { status, providerId, symbol, from, to },
      pagination: { page, limit },
    });

    return paginatedResponse(res, { items: result.items, meta: result.meta });
  }),
);

router.get(
  '/status-breakdown',
  asyncHandler(async (req, res) => {
    const breakdown = await adminSignalMonitorService.getStatusBreakdown({ since: req.query.since });
    return successResponse(res, { breakdown });
  }),
);

router.get(
  '/rejected',
  asyncHandler(async (req, res) => {
    const signals = await adminSignalMonitorService.listRejectedSignals({
      limit: req.query.limit ? Number(req.query.limit) : 50,
    });
    return successResponse(res, { signals });
  }),
);

router.get(
  '/duplicate',
  asyncHandler(async (req, res) => {
    const signals = await adminSignalMonitorService.listDuplicateSignals({
      limit: req.query.limit ? Number(req.query.limit) : 50,
    });
    return successResponse(res, { signals });
  }),
);

router.get(
  '/:signalId',
  asyncHandler(async (req, res) => {
    const signal = await adminSignalMonitorService.getSignalDetails({ signalId: req.params.signalId });
    return successResponse(res, { signal });
  }),
);

export default router;