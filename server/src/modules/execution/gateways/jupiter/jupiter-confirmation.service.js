'use strict';

const {
  Connection,
  PublicKey,
} = require('@solana/web3.js');

const jupiterRepository = require('./jupiter.repository');

const {
  JUPITER_CONFIRMATION_TIMEOUT_MS,
  JUPITER_CONFIRMATION_POLL_INTERVAL_MS,
  JUPITER_CONFIRMATION_MAX_POLL_ATTEMPTS,
} = require('./jupiter.constants');

const {
  ConfirmationTimeoutError,
  TransactionFailedError,
} = require('./jupiter.errors');

const { config } = require('../../routers/execution-router.config');

/**
 * SignalForge - Jupiter Confirmation Service
 *
 * Verifies that a submitted swap transaction confirmed on-chain and
 * records the result in the Jupiter repository. The service uses a
 * bounded polling loop so that a slow confirmation never blocks a
 * worker indefinitely.
 */

let cachedConnection = null;

function getConnection() {
  if (cachedConnection) {
    return cachedConnection;
  }

  const endpoint =
    process.env.SOLANA_RPC_URL ||
    (String(config.network || 'mainnet-beta').includes('devnet')
      ? 'https://api.devnet.solana.com'
      : 'https://api.mainnet-beta.solana.com');

  cachedConnection = new Connection(endpoint, config.commitment || 'confirmed');
  return cachedConnection;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchSignatureStatus(signature) {
  const connection = getConnection();
  const response = await connection.getSignatureStatuses([signature], {
    searchTransactionHistory: true,
  });
  return response && response.value ? response.value[0] : null;
}

async function fetchTransaction(signature) {
  const connection = getConnection();
  try {
    return await connection.getTransaction(signature, {
      commitment: config.commitment || 'confirmed',
      maxSupportedTransactionVersion: 0,
    });
  } catch (_error) {
    return null;
  }
}

async function pollForConfirmation(signature, { commitment = 'confirmed' } = {}) {
  const timeoutAt = Date.now() + JUPITER_CONFIRMATION_TIMEOUT_MS;
  let attempt = 0;
  let lastError = null;

  while (Date.now() < timeoutAt && attempt < JUPITER_CONFIRMATION_MAX_POLL_ATTEMPTS) {
    attempt += 1;

    try {
      const status = await fetchSignatureStatus(signature);

      if (status) {
        if (status.err) {
          throw new TransactionFailedError('Jupiter swap failed on-chain', {
            signature,
            error: status.err,
          });
        }

        if (status.confirmationStatus === commitment || status.confirmationStatus === 'finalized') {
          return {
            confirmed: true,
            slot: status.slot,
            confirmationStatus: status.confirmationStatus,
            attempts: attempt,
          };
        }
      }
    } catch (error) {
      if (error instanceof TransactionFailedError) {
        throw error;
      }
      lastError = error;
    }

    await sleep(JUPITER_CONFIRMATION_POLL_INTERVAL_MS);
  }

  throw new ConfirmationTimeoutError('Jupiter swap confirmation timed out', {
    signature,
    attempts: attempt,
    timeoutMs: JUPITER_CONFIRMATION_TIMEOUT_MS,
    lastError: lastError ? lastError.message : null,
  });
}

async function confirmSwap({ swapId, signature }) {
  if (!swapId && !signature) {
    throw new ConfirmationTimeoutError('swapId or signature is required');
  }

  let swap = null;

  if (swapId) {
    swap = await jupiterRepository.findSwapById(swapId);
  } else {
    swap = await jupiterRepository.findSwapBySignature(signature);
  }

  if (!swap) {
    throw new ConfirmationTimeoutError('Swap record was not found', { swapId, signature });
  }

  const effectiveSignature = signature || swap.transaction_signature;

  try {
    const result = await pollForConfirmation(effectiveSignature);

    const updated = await jupiterRepository.updateSwapStatus(swap.id, {
      status: 'confirmed',
      blockSlot: result.slot,
      confirmedAt: new Date().toISOString(),
    });

    return {
      swapId: swap.id,
      signature: effectiveSignature,
      status: 'confirmed',
      blockSlot: result.slot,
      confirmationStatus: result.confirmationStatus,
      attempts: result.attempts,
      record: updated,
    };
  } catch (error) {
    const failedStatus = error instanceof ConfirmationTimeoutError ? 'pending' : 'failed';

    await jupiterRepository.updateSwapStatus(swap.id, {
      status: failedStatus,
      errorMessage: error.message,
    });

    throw error;
  }
}

async function reconcile({ swapId, signature } = {}) {
  const swap = swapId
    ? await jupiterRepository.findSwapById(swapId)
    : await jupiterRepository.findSwapBySignature(signature);

  if (!swap) {
    return { reconciled: false, reason: 'not_found' };
  }

  if (swap.status === 'confirmed' || swap.status === 'failed') {
    return { reconciled: false, reason: 'final', status: swap.status };
  }

  const effectiveSignature = signature || swap.transaction_signature;

  try {
    const result = await confirmSwap({ swapId: swap.id, signature: effectiveSignature });
    return { reconciled: true, result };
  } catch (error) {
    return {
      reconciled: false,
      reason: error.message,
      status: 'pending',
    };
  }
}

async function fetchTransactionDetails(signature) {
  const transaction = await fetchTransaction(signature);
  if (!transaction) {
    return null;
  }
  return {
    slot: transaction.slot,
    blockTime: transaction.blockTime,
    meta: transaction.meta,
  };
}

function clearConnectionCache() {
  cachedConnection = null;
}

module.exports = {
  getConnection,
  pollForConfirmation,
  confirmSwap,
  reconcile,
  fetchSignatureStatus,
  fetchTransaction,
  fetchTransactionDetails,
  clearConnectionCache,
};