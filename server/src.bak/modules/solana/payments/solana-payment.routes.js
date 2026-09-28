/**
 * Solana Payment Routes
 *
 * @module server/modules/solana/payments/solana-payment.routes
 */

import { Router } from 'express';
import { solanaPaymentController } from './solana-payment.controller';
import { authenticationMiddleware } from '../../../middleware/authentication.middleware';
import { asyncHandler } from '../../../lib/async-handler';

const router = Router();

router.use(authenticationMiddleware);

router.get(
  '/',
  asyncHandler(solanaPaymentController.listPayments),
);

router.post(
  '/',
  asyncHandler(solanaPaymentController.createPayment),
);

router.get(
  '/status-breakdown',
  asyncHandler(solanaPaymentController.getStatusBreakdown),
);

router.post(
  '/sweep/pending',
  asyncHandler(solanaPaymentController.sweepPending),
);

router.post(
  '/sweep/expired',
  asyncHandler(solanaPaymentController.sweepExpired),
);

router.post(
  '/:paymentId/attach-signature',
  asyncHandler(solanaPaymentController.attachSignature),
);

router.post(
  '/:paymentId/verify',
  asyncHandler(solanaPaymentController.verifyPayment),
);

router.post(
  '/:paymentId/confirm',
  asyncHandler(solanaPaymentController.confirmPayment),
);

router.post(
  '/:paymentId/mark-confirmed',
  asyncHandler(solanaPaymentController.markConfirmed),
);

router.post(
  '/:paymentId/mark-failed',
  asyncHandler(solanaPaymentController.markFailed),
);

router.post(
  '/:paymentId/refund',
  asyncHandler(solanaPaymentController.refundPayment),
);

router.get(
  '/:paymentId',
  asyncHandler(solanaPaymentController.getPayment),
);

export default router;