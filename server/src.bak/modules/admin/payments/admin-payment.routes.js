/**
 * Admin Payment Routes
 *
 * @module server/modules/admin/payments/admin-payment.routes
 */

import { Router } from 'express';
import { adminPaymentService } from './admin-payment.service';
import { asyncHandler } from '../../../lib/async-handler';
import { successResponse } from '../../../lib/response/success.response';
import { paginatedResponse } from '../../../lib/response/paginated.response';

const router = Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { page, limit, status, userId, provider, from, to } = req.query;

    const result = await adminPaymentService.listPayments({
      filters: { status, userId, provider, from, to },
      pagination: { page, limit },
    });

    return paginatedResponse(res, { items: result.items, meta: result.meta });
  }),
);

router.get(
  '/status-breakdown',
  asyncHandler(async (req, res) => {
    const result = await adminPaymentService.getStatusBreakdown({ since: req.query.since });
    return successResponse(res, result);
  }),
);

router.get(
  '/revenue-by-provider',
  asyncHandler(async (req, res) => {
    const revenue = await adminPaymentService.getRevenueByProvider({ since: req.query.since });
    return successResponse(res, { revenue });
  }),
);

router.get(
  '/:paymentId',
  asyncHandler(async (req, res) => {
    const payment = await adminPaymentService.getPaymentDetails({ paymentId: req.params.paymentId });
    return successResponse(res, { payment });
  }),
);

router.post(
  '/:paymentId/refund',
  asyncHandler(async (req, res) => {
    const adminId = req.user.id;
    const result = await adminPaymentService.refundPayment({
      paymentId: req.params.paymentId,
      adminId,
      reason: req.body ? req.body.reason : null,
      refundAmount: req.body ? req.body.refundAmount : undefined,
    });
    return successResponse(res, result);
  }),
);

export default router;