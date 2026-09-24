/**
 * Solana Payment Controller
 *
 * @module server/modules/solana/payments/solana-payment.controller
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { successResponse } from '../../../lib/response/success.response';
import { paginatedResponse } from '../../../lib/response/paginated.response';
import { solanaPaymentService } from './solana-payment.service';
import { paymentConfirmationService } from './payment-confirmation.service';
import {
  validateCreatePaymentPayload,
  validateAttachSignaturePayload,
  validateRefundPayload,
} from './solana-payment.validator';

function requireUser(req) {
  const userId = req.user && req.user.id;
  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }
  return userId;
}

function requireAdmin(req) {
  const userId = requireUser(req);
  const roles = req.user.roles || [];
  if (!roles.some((r) => ['ADMIN', 'SUPER_ADMIN', 'FINANCE_ADMIN'].includes(r))) {
    throw new AppError('Finance or administrator access required', ERROR_CODES.AUTHORIZATION_FAILED, 403);
  }
  return userId;
}

export async function createPayment(req, res) {
  const userId = requireUser(req);

  const payload = validateCreatePaymentPayload(req.body || {});

  const payment = await solanaPaymentService.createPayment({
    userId,
    ...payload,
  });

  return successResponse(res, { payment }, 201);
}

export async function attachSignature(req, res) {
  requireUser(req);

  const payload = validateAttachSignaturePayload(req.body || {});

  const payment = await solanaPaymentService.attachSignature({
    paymentId: req.params.paymentId,
    txSignature: payload.txSignature,
    senderWallet: payload.senderWallet,
  });

  return successResponse(res, { payment });
}

export async function getPayment(req, res) {
  requireUser(req);

  const payment = await solanaPaymentService.getPayment({
    paymentId: req.params.paymentId,
  });

  return successResponse(res, { payment });
}

export async function listPayments(req, res) {
  const userId = requireUser(req);

  const { page, limit, status, purpose, token } = req.query;

  const result = await solanaPaymentService.listPayments({
    userId,
    filters: { status, purpose, token },
    pagination: { page, limit },
  });

  return paginatedResponse(res, { items: result.items, meta: result.meta });
}

export async function markConfirmed(req, res) {
  requireAdmin(req);

  const { txSignature, slot, blockTime, confirmations } = req.body || {};

  const result = await solanaPaymentService.markConfirmed({
    paymentId: req.params.paymentId,
    txSignature,
    slot,
    blockTime,
    confirmations,
  });

  return successResponse(res, result);
}

export async function markFailed(req, res) {
  requireAdmin(req);

  const { reason } = req.body || {};

  const result = await solanaPaymentService.markFailed({
    paymentId: req.params.paymentId,
    reason,
  });

  return successResponse(res, result);
}

export async function refundPayment(req, res) {
  requireAdmin(req);

  const payload = validateRefundPayload(req.body || {});

  const result = await solanaPaymentService.refundPayment({
    paymentId: req.params.paymentId,
    refundTxSignature: payload.refundTxSignature,
    reason: payload.reason,
  });

  return successResponse(res, result);
}

export async function verifyPayment(req, res) {
  requireAdmin(req);

  const { paymentVerificationService } = await import('./payment-verification.service');

  const result = await paymentVerificationService.verifyPayment({
    paymentId: req.params.paymentId,
  });

  return successResponse(res, { verification: result });
}

export async function confirmPayment(req, res) {
  requireAdmin(req);

  const result = await paymentConfirmationService.confirmPayment({
    paymentId: req.params.paymentId,
  });

  return successResponse(res, result);
}

export async function sweepPending(req, res) {
  requireAdmin(req);

  const result = await paymentConfirmationService.confirmPendingPayments({
    limit: req.query.limit ? Number(req.query.limit) : 100,
  });

  return successResponse(res, result);
}

export async function sweepExpired(req, res) {
  requireAdmin(req);

  const result = await solanaPaymentService.sweepExpiredPayments({
    limit: req.query.limit ? Number(req.query.limit) : 200,
  });

  return successResponse(res, result);
}

export async function getStatusBreakdown(req, res) {
  requireAdmin(req);

  const result = await solanaPaymentService.getStatusBreakdown();

  return successResponse(res, result);
}

export const solanaPaymentController = {
  createPayment,
  attachSignature,
  getPayment,
  listPayments,
  markConfirmed,
  markFailed,
  refundPayment,
  verifyPayment,
  confirmPayment,
  sweepPending,
  sweepExpired,
  getStatusBreakdown,
};