/**
 * Transaction Service
 *
 * Top-level orchestration for Solana transactions. Combines the
 * builder, submitter, confirmer, and repository.
 *
 * @module server/modules/solana/transactions/transaction.service
 */
const { AppError } = require('../../../lib/errors/app-error');
const { ERROR_CODES } = require('../../../lib/errors/error-codes');
const { normalizePagination, buildPaginationMeta } = require('@signalforge/shared/utils/pagination.util');
const { transactionRepository } = require('./transaction.repository');
const { transactionBuilderService } = require('./transaction-builder.service');
const { transactionSubmitterService } = require('./transaction-submitter.service');
const { transactionConfirmerService } = require('./transaction-confirmer.service');

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
async function recordTransaction({
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
async function getTransaction({ txSignature }) {
  if (!txSignature) {
    throw new AppError('txSignature is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const record = await transactionRepository.findBySignature({ txSignature });

  if (!record) {
    throw new AppError('Transaction not found', ERROR_CODES.NOT_FOUND, 404);
  }

  return mapTransaction(record);
}
async function listUserTransactions({ userId, filters = {}, pagination = {} }) {
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
async function getStatusBreakdown() {
  const rows = await transactionRepository.countByStatus();

  const breakdown = {};
  for (const row of rows) {
    breakdown[row.status] = row.count;
  }

  return breakdown;
}
const transactionService = {
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
module.exports.transactionService = transactionService;

module.exports.recordTransaction = recordTransaction;

module.exports.getTransaction = getTransaction;

module.exports.listUserTransactions = listUserTransactions;

module.exports.getStatusBreakdown = getStatusBreakdown;
