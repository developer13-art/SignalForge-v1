/**
 * Admin Withdrawal Service
 *
 * @module server/modules/admin/withdrawals/admin-withdrawal.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { logger } from '../../../lib/logger';
import { normalizePagination, buildPaginationMeta } from '@signalforge/shared/utils/pagination.util';
import * as repository from './admin-withdrawal.repository';
import { adminService } from '../admin.service';

export async function listWithdrawals({ filters = {}, pagination = {} }) {
  const { page, limit, offset } = normalizePagination(pagination);

  const result = await repository.listWithdrawals({
    filters,
    pagination: { limit, offset },
  });

  return {
    items: result.items.map((row) => ({
      withdrawalId: row.id,
      userId: row.user_id,
      userEmail: row.user_email,
      amount: Number(row.amount || 0),
      currency: row.currency,
      method: row.method,
      source: row.source,
      status: row.status,
      notes: row.notes,
      createdAt: row.created_at,
      processedAt: row.processed_at,
    })),
    meta: buildPaginationMeta({ page, limit, total: result.total }),
  };
}

export async function getWithdrawalDetails({ withdrawalId }) {
  if (!withdrawalId) {
    throw new AppError('withdrawalId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const withdrawal = await repository.findWithdrawalById({ withdrawalId });

  if (!withdrawal) {
    throw new AppError('Withdrawal not found', ERROR_CODES.NOT_FOUND, 404);
  }

  return withdrawal;
}

export async function approveWithdrawal({ withdrawalId, adminId }) {
  if (!withdrawalId || !adminId) {
    throw new AppError('withdrawalId and adminId are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const withdrawal = await repository.findWithdrawalById({ withdrawalId });

  if (!withdrawal) {
    throw new AppError('Withdrawal not found', ERROR_CODES.NOT_FOUND, 404);
  }

  if (withdrawal.status !== 'PENDING' && withdrawal.status !== 'UNDER_REVIEW') {
    throw new AppError('Withdrawal is not in a reviewable state', ERROR_CODES.CONFLICT, 409);
  }

  await repository.updateWithdrawalStatus({
    withdrawalId,
    status: 'APPROVED',
    adminId,
  });

  await adminService.recordAdminAction({
    adminId,
    action: 'WITHDRAWAL_APPROVE',
    targetType: 'WITHDRAWAL',
    targetId: withdrawalId,
    details: { amount: Number(withdrawal.amount) },
  });

  logger.info({ withdrawalId, adminId }, 'Withdrawal approved');

  return { approved: true };
}

export async function rejectWithdrawal({ withdrawalId, adminId, reason }) {
  if (!withdrawalId || !adminId) {
    throw new AppError('withdrawalId and adminId are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const withdrawal = await repository.findWithdrawalById({ withdrawalId });

  if (!withdrawal) {
    throw new AppError('Withdrawal not found', ERROR_CODES.NOT_FOUND, 404);
  }

  await repository.updateWithdrawalStatus({
    withdrawalId,
    status: 'REJECTED',
    adminId,
    reason,
  });

  await adminService.recordAdminAction({
    adminId,
    action: 'WITHDRAWAL_REJECT',
    targetType: 'WITHDRAWAL',
    targetId: withdrawalId,
    details: { reason },
  });

  logger.info({ withdrawalId, adminId, reason }, 'Withdrawal rejected');

  return { rejected: true };
}

export async function markCompleted({ withdrawalId, adminId }) {
  if (!withdrawalId || !adminId) {
    throw new AppError('withdrawalId and adminId are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  await repository.updateWithdrawalStatus({
    withdrawalId,
    status: 'COMPLETED',
    adminId,
  });

  await adminService.recordAdminAction({
    adminId,
    action: 'WITHDRAWAL_APPROVE',
    targetType: 'WITHDRAWAL',
    targetId: withdrawalId,
    details: { action: 'COMPLETE' },
  });

  logger.info({ withdrawalId, adminId }, 'Withdrawal marked completed');

  return { completed: true };
}

export async function getStatusBreakdown() {
  const rows = await repository.countByStatus();

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

export const adminWithdrawalService = {
  listWithdrawals,
  getWithdrawalDetails,
  approveWithdrawal,
  rejectWithdrawal,
  markCompleted,
  getStatusBreakdown,
};