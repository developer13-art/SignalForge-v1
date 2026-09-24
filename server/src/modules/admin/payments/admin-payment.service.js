/**
 * Admin Payment Service
 *
 * @module server/modules/admin/payments/admin-payment.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { logger } from '../../../lib/logger';
import { normalizePagination, buildPaginationMeta } from '@signalforge/shared/utils/pagination.util';
import * as repository from './admin-payment.repository';
import { adminService } from '../admin.service';

export async function listPayments({ filters = {}, pagination = {} }) {
  const { page, limit, offset } = normalizePagination(pagination);

  const result = await repository.listPayments({
    filters,
    pagination: { limit, offset },
  });

  return {
    items: result.items.map((row) => ({
      paymentId: row.id,
      userId: row.user_id,
      userEmail: row.user_email,
      subscriptionId: row.subscription_id,
      amount: Number(row.amount || 0),
      currency: row.currency,
      provider: row.provider,
      providerReference: row.provider_reference,
      status: row.status,
      method: row.method,
      createdAt: row.created_at,
      confirmedAt: row.confirmed_at,
    })),
    meta: buildPaginationMeta({ page, limit, total: result.total }),
  };
}

export async function getPaymentDetails({ paymentId }) {
  if (!paymentId) {
    throw new AppError('paymentId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const payment = await repository.findPaymentById({ paymentId });

  if (!payment) {
    throw new AppError('Payment not found', ERROR_CODES.NOT_FOUND, 404);
  }

  return payment;
}

export async function refundPayment({ paymentId, adminId, reason, refundAmount }) {
  if (!paymentId || !adminId) {
    throw new AppError('paymentId and adminId are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const payment = await repository.findPaymentById({ paymentId });

  if (!payment) {
    throw new AppError('Payment not found', ERROR_CODES.NOT_FOUND, 404);
  }

  if (payment.status === 'REFUNDED') {
    return { refunded: false, reason: 'ALREADY_REFUNDED' };
  }

  if (payment.status !== 'SUCCEEDED') {
    throw new AppError('Only succeeded payments can be refunded', ERROR_CODES.CONFLICT, 409);
  }

  const amount = refundAmount !== undefined && refundAmount !== null
    ? Number(refundAmount)
    : Number(payment.amount);

  if (!Number.isFinite(amount) || amount <= 0 || amount > Number(payment.amount)) {
    throw new AppError('Invalid refund amount', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  await repository.markRefunded({ paymentId, adminId, reason, refundAmount: amount });

  await adminService.recordAdminAction({
    adminId,
    action: 'PAYMENT_REFUND',
    targetType: 'PAYMENT',
    targetId: paymentId,
    details: { amount, reason },
  });

  logger.info({ paymentId, adminId, amount, reason }, 'Payment refunded');

  return { refunded: true, amount };
}

export async function getStatusBreakdown({ since }) {
  const rows = await repository.countByStatus({ since });

  const breakdown = {};
  let totalAmount = 0;

  for (const row of rows) {
    breakdown[row.status] = {
      count: row.count,
      totalAmount: Number(row.total_amount || 0),
    };
    totalAmount += Number(row.total_amount || 0);
  }

  return { breakdown, totalAmount };
}

export async function getRevenueByProvider({ since }) {
  const rows = await repository.sumRevenueByProvider({ since });

  return rows.map((row) => ({
    provider: row.provider,
    totalAmount: Number(row.total_amount || 0),
    count: row.count,
  }));
}

export const adminPaymentService = {
  listPayments,
  getPaymentDetails,
  refundPayment,
  getStatusBreakdown,
  getRevenueByProvider,
};