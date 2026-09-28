'use strict';

const { Connection } = require('@solana/web3.js');

const raydiumRepository = require('./raydium.repository');

const {
  RAYDIUM_CONFIRMATION_TIMEOUT_MS,
  RAYDIUM_CONFIRMATION_POLL_INTERVAL_MS,
  RAYDIUM_CONFIRMATION_MAX_POLL_ATTEMPTS,
} = require('./raydium.constants');

const {
  ConfirmationTimeoutError,
  TransactionFailedError,
} = require('./raydium.errors');

const { config } = require('../../routers/execution-router.config');

/**
 * SignalForge - Raydium Confirmation Service
 *
 * Polls the Solana RPC endpoint until a submitted Raydium swap
 * transaction is either confirmed or determined to have failed.
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

async function pollForConfirmation(signature, { commitment = 'confirmed' } = {}) {
  const timeoutAt = Date.now() + RAYDIUM_CONFIRMATION_TIMEOUT_MS;
  let attempt = 0;

  while (Date.now() < timeoutAt && attempt < RAYDIUM_CONFIRMATION_MAX_POLL_ATTEMPTS) {
    attempt += 1;

    const status = await fetchSignatureStatus(signature);

    if (status) {
      if (status.err) {
        throw new TransactionFailedError('Raydium swap failed on-chain', {
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

    await sleep(RAYDIUM_CONFIRMATION_POLL_INTERVAL_MS);
  }

  throw new ConfirmationTimeoutError('Raydium swap confirmation timed out', {
    signature,
    attempts: attempt,
    timeoutMs: RAYDIUM_CONFIRMATION_TIMEOUT_MS,
  });
}

async function confirmSwap({ swapId, signature }) {
  if (!swapId && !signature) {
    throw new ConfirmationTimeoutError('swapId or signature is required');
  }

  const swap = swapId
    ? await raydiumRepository.findSwapById(swapId)
    : await raydiumRepository.findSwapBySignature(signature);

  if (!swap) {
    throw new ConfirmationTimeoutError('Swap record was not found', { swapId, signature });
  }

  const effectiveSignature = signature || swap.transaction_signature;

  try {
    const result = await pollForConfirmation(effectiveSignature);

    const updated = await raydiumRepository.updateSwapStatus(swap.id, {
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
    await raydiumRepository.updateSwapStatus(swap.id, {
      status: failedStatus,
      errorMessage: error.message,
    });
    throw error;
  }
}

async function reconcile({ swapId, signature } = {}) {
  const swap = swapId
    ? await raydiumRepository.findSwapById(swapId)
    : await raydiumRepository.findSwapBySignature(signature);

  if (!swap) {
    return { reconciled: false, reason: 'not_found' };
  }

  if (swap.status === 'confirmed' || swap.status === 'failed') {
    return { reconciled: false, reason: 'final', status: swap.status };
  }

  try {
    const result = await confirmSwap({
      swapId: swap.id,
      signature: signature || swap.transaction_signature,
    });
    return { reconciled: true, result };
  } catch (error) {
    return { reconciled: false, reason: error.message, status: 'pending' };
  }
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
  clearConnectionCache,
};