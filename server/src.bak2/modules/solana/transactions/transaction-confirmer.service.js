/**
 * Transaction Confirmer Service
 *
 * Confirms a submitted Solana transaction by polling the RPC
 * endpoint until the transaction is confirmed or the confirmation
 * timeout is reached.
 *
 * @module server/modules/solana/transactions/transaction-confirmer.service
 */
const { AppError } = require('../../../lib/errors/app-error');
const { ERROR_CODES } = require('../../../lib/errors/error-codes');
const { logger } = require('../../../lib/logger');
const { sleep } = require('@signalforge/shared/utils/retry.util');
const { connectionService } = require('../config/connection.service');
const { transactionRepository } = require('./transaction.repository');
const { SOLANA_CONFIRMATION_TIMEOUT_MS, SOLANA_INDEXER_POLL_INTERVAL_MS } = require('../solana.constants');
const { emitTransactionConfirmed, emitTransactionFailed } = require('../solana.events');

export async function confirmTransaction({
  txSignature,
  lastValidBlockHeight,
  timeoutMs = SOLANA_CONFIRMATION_TIMEOUT_MS,
}) {
  if (!txSignature) {
    throw new AppError('txSignature is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const connection = await connectionService.getConnection();

  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    try {
      const status = await connection.getSignatureStatus(txSignature, {
        searchTransactionHistory: false,
      });

      if (status && status.value) {
        if (status.value.err) {
          await transactionRepository.updateStatus({
            txSignature,
            status: 'FAILED',
            errorReason: JSON.stringify(status.value.err),
          });

          await emitTransactionFailed({
            txSignature,
            purpose: null,
            reason: JSON.stringify(status.value.err),
          }).catch((err) => logger.warn({ err }, 'Failed to emit transaction failed event'));

          return { confirmed: false, failed: true, error: status.value.err };
        }

        if (
          status.value.confirmationStatus === 'confirmed' ||
          status.value.confirmationStatus === 'finalized'
        ) {
          let slot = null;
          let blockTime = null;

          try {
            const tx = await connection.getTransaction(txSignature, {
              commitment: 'confirmed',
              maxSupportedTransactionVersion: 0,
            });
            if (tx) {
              slot = tx.slot;
              blockTime = tx.blockTime;
            }
          } catch (err) {
            logger.warn({ err, txSignature }, 'Failed to fetch confirmed transaction details');
          }

          await transactionRepository.updateStatus({
            txSignature,
            status: 'CONFIRMED',
            slot,
            blockTime,
          });

          await emitTransactionConfirmed({
            txSignature,
            purpose: null,
            slot,
          }).catch((err) => logger.warn({ err }, 'Failed to emit transaction confirmed event'));

          return {
            confirmed: true,
            slot,
            blockTime,
            confirmationStatus: status.value.confirmationStatus,
          };
        }
      }

      if (lastValidBlockHeight) {
        const currentBlockHeight = await connection.getBlockHeight('confirmed');
        if (currentBlockHeight > lastValidBlockHeight) {
          await transactionRepository.updateStatus({
            txSignature,
            status: 'EXPIRED',
            errorReason: 'BLOCK_HEIGHT_EXCEEDED',
          });
          return { confirmed: false, expired: true };
        }
      }
    } catch (err) {
      logger.warn({ err, txSignature }, 'Confirmation poll failed');
    }

    await sleep(SOLANA_INDEXER_POLL_INTERVAL_MS);
  }

  await transactionRepository.updateStatus({
    txSignature,
    status: 'FAILED',
    errorReason: 'CONFIRMATION_TIMEOUT',
  });

  return { confirmed: false, reason: 'TIMEOUT' };
}

export async function confirmPendingTransactions({ limit = 100 }) {
  const pending = await transactionRepository.listPendingForConfirmation({ limit });

  const results = [];

  for (const tx of pending) {
    try {
      const result = await confirmTransaction({ txSignature: tx.tx_signature });
      results.push({ txSignature: tx.tx_signature, ...result });
    } catch (err) {
      logger.warn({ err, txSignature: tx.tx_signature }, 'Confirmation failed');
      results.push({ txSignature: tx.tx_signature, confirmed: false, error: err.message });
    }
  }

  return { processed: results.length, results };
}
const transactionConfirmerService = {
  confirmTransaction,
  confirmPendingTransactions,
};
module.exports.transactionConfirmerService = transactionConfirmerService;
