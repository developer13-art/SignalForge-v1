/**
 * Transaction Submitter Service
 *
 * Submits a signed Solana transaction to the RPC endpoint and
 * records its lifecycle in the transaction repository. Retries on
 * transient failures with exponential backoff.
 *
 * @module server/modules/solana/transactions/transaction-submitter.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { logger } from '../../../lib/logger';
import { sleep } from '@signalforge/shared/utils/retry.util';
import { calculateBackoff } from '@signalforge/shared/utils/backoff.util';
import { connectionService } from '../config/connection.service';
import { transactionRepository } from './transaction.repository';
import { SOLANA_MAX_RETRIES, SOLANA_RETRY_DELAY_MS } from '../solana.constants';

async function loadWeb3() {
  try {
    const module = await import('@solana/web3.js');
    if (!module || !module.VersionedTransaction) {
      throw new Error('VersionedTransaction missing');
    }
    return module;
  } catch (err) {
    throw new AppError(
      'Solana web3 library is not available',
      ERROR_CODES.CONFIGURATION_MISSING,
      500,
    );
  }
}

async function submitOnce({ serializedTransaction, skipPreflight = false }) {
  const web3 = await loadWeb3();
  const connection = await connectionService.getConnection();

  const transaction = web3.VersionedTransaction.deserialize(serializedTransaction);

  const signature = await connection.sendRawTransaction(transaction.serialize(), {
    skipPreflight,
    preflightCommitment: 'confirmed',
    maxRetries: 0,
  });

  return signature;
}

export async function submitTransaction({
  serializedTransaction,
  purpose,
  referenceType,
  referenceId,
  userId,
  maxAttempts = SOLANA_MAX_RETRIES,
}) {
  if (!serializedTransaction) {
    throw new AppError('serializedTransaction is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  let lastError = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const signature = await submitOnce({ serializedTransaction });

      await transactionRepository.insertTransaction({
        txSignature: signature,
        purpose,
        referenceType,
        referenceId,
        userId,
        status: 'SUBMITTED',
      });

      logger.info({ signature, purpose, attempt }, 'Solana transaction submitted');

      return { submitted: true, signature, attempt };
    } catch (err) {
      lastError = err;
      logger.warn({ err, attempt, purpose }, 'Transaction submission failed');

      if (attempt < maxAttempts) {
        const delay = calculateBackoff(attempt, 'exponential-jitter', {
          baseDelay: SOLANA_RETRY_DELAY_MS,
          maxDelay: 30000,
        });
        await sleep(delay);
      }
    }
  }

  logger.error({ err: lastError, purpose }, 'Transaction submission exhausted retries');

  return {
    submitted: false,
    reason: 'MAX_ATTEMPTS_EXCEEDED',
    error: lastError ? lastError.message : null,
  };
}

export async function recordFailure({ txSignature, reason }) {
  if (!txSignature) {
    return { recorded: false };
  }

  await transactionRepository.updateStatus({
    txSignature,
    status: 'FAILED',
    errorReason: reason || 'UNKNOWN',
  });

  return { recorded: true };
}

export const transactionSubmitterService = {
  submitTransaction,
  recordFailure,
};