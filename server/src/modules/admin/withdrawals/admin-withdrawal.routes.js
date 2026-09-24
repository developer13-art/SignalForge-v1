/**
 * Admin Withdrawal Routes
 *
 * @module server/modules/admin/withdrawals/admin-withdrawal.routes
 */

import { Router } from 'express';
import { adminWithdrawalService } from './admin-withdrawal.service';
import { asyncHandler } from '../../../lib/async-handler';
import { successResponse } from '../../../lib/response/success.response';
import { paginatedResponse } from '../../../lib/response/paginated.response';

const router = Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { page, limit, status, userId, method, source } = req.query;

    const result = await adminWithdrawalService.listWithdrawals({
      filters: { status, userId, method, source },
      pagination: { page, limit },
    });

    return paginatedResponse(res, { items: result.items, meta: result.meta });
  }),
);

router.get(
  '/status-breakdown',
  asyncHandler(async (req, res) => {
    const result = await adminWithdrawalService.getStatusBreakdown();
    return successResponse(res, result);
  }),
);

router.get(
  '/:withdrawalId',
  asyncHandler(async (req, res) => {
    const withdrawal = await adminWithdrawalService.getWithdrawalDetails({
      withdrawalId: req.params.withdrawalId,
    });
    return successResponse(res, { withdrawal });
  }),
);

router.post(
  '/:withdrawalId/approve',
  asyncHandler(async (req, res) => {
    const adminId = req.user.id;
    const result = await adminWithdrawalService.approveWithdrawal({
      withdrawalId: req.params.withdrawalId,
      adminId,
    });
    return successResponse(res, result);
  }),
);

router.post(
  '/:withdrawalId/reject',
  asyncHandler(async (req, res) => {
    const adminId = req.user.id;
    const result = await adminWithdrawalService.rejectWithdrawal({
      withdrawalId: req.params.withdrawalId,
      adminId,
      reason: req.body ? req.body.reason : null,
    });
    return successResponse(res, result);
  }),
);

router.post(
  '/:withdrawalId/complete',
  asyncHandler(async (req, res) => {
    const adminId = req.user.id;
    const result = await adminWithdrawalService.markCompleted({
      withdrawalId: req.params.withdrawalId,
      adminId,
    });
    return successResponse(res, result);
  }),
);

export default router;