/**
 * Transaction Service
 *
 * Top-level orchestration for Solana transactions. Combines the
 * builder, submitter, confirmer, and repository.
 *
 * @module server/modules/solana/transactions/transaction.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { normalizePagination, buildPaginationMeta } from '@signalforge/shared/utils/pagination.util';
import { transactionRepository } from './transaction.repository';
import { transactionBuilderService } from './transaction-builder.service';
import { transactionSubmitterService } from './transaction-submitter.service';
import { transactionConfirmerService } from './transaction-confirmer.service';

function mapTransaction(row) {
  return {
    transactionId: row.id,
    txSignature: row.tx_signature,
    purpose: row.purpose,
    referenceType: row.reference_type,
    referenceId: row.reference_id,
    userId: row.user_id,
    status: row.status,
    slot: row.slot,
    blockTime: row.block_time,
    errorReason: row.error_reason,
    confirmedAt: row.confirmed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function recordTransaction({
  txSignature,
  purpose,
  referenceType,
  referenceId,
  userId,
  status,
  slot,
  blockTime,
}) {
  if (!txSignature) {
    throw new AppError('txSignature is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const record = await transactionRepository.insertTransaction({
    txSignature,
    purpose,
    referenceType,
    referenceId,
    userId,
    status,
    slot,
    blockTime,
  });

  return record ? mapTransaction(record) : null;
}

export async function getTransaction({ txSignature }) {
  if (!txSignature) {
    throw new AppError('txSignature is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const record = await transactionRepository.findBySignature({ txSignature });

  if (!record) {
    throw new AppError('Transaction not found', ERROR_CODES.NOT_FOUND, 404);
  }

  return mapTransaction(record);
}

export async function listUserTransactions({ userId, filters = {}, pagination = {} }) {
  if (!userId) {
    throw new AppError('userId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const { page, limit, offset } = normalizePagination(pagination);

  const result = await transactionRepository.listByUser({
    userId,
    filters,
    pagination: { limit, offset },
  });

  return {
    items: result.items.map(mapTransaction),
    meta: buildPaginationMeta({ page, limit, total: result.total }),
  };
}

export async function getStatusBreakdown() {
  const rows = await transactionRepository.countByStatus();

  const breakdown = {};
  for (const row of rows) {
    breakdown[row.status] = row.count;
  }

  return breakdown;
}

export const transactionService = {
  recordTransaction,
  getTransaction,
  listUserTransactions,
  getStatusBreakdown,

  buildSolTransferTransaction: transactionBuilderService.buildSolTransferTransaction,
  buildMemoTransaction: transactionBuilderService.buildMemoTransaction,
  serializeTransaction: transactionBuilderService.serializeTransaction,

  submitTransaction: transactionSubmitterService.submitTransaction,
  recordFailure: transactionSubmitterService.recordFailure,

  confirmTransaction: transactionConfirmerService.confirmTransaction,
  confirmPendingTransactions: transactionConfirmerService.confirmPendingTransactions,
};