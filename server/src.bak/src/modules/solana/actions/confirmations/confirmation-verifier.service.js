'use strict';

const { Connection, PublicKey } = require('@solana/web3.js');

const { config } = require('../actions.config');
const {
  ACTIONS_CONFIRMATION_TIMEOUT_MS,
  ACTIONS_CONFIRMATION_POLL_INTERVAL_MS,
  ACTIONS_CONFIRMATION_MAX_POLL_ATTEMPTS,
} = require('../actions.constants');

const {
  ConfirmationTimeoutError,
  ConfirmationFailedError,
  ServiceUnavailableError,
} = require('../actions.errors');

/**
 * SignalForge - Confirmation Verifier Service
 *
 * Verifies that a transaction signature exists on-chain and that it
 * reached the requested commitment level. Verification uses a bounded
 * polling loop with a strict timeout, so a stalled transaction never
 * blocks a worker indefinitely.
 */

let cachedConnection = null;

function getConnection() {
  if (cachedConnection) {
    return cachedConnection;
  }
  const endpoint =
    process.env.SOLANA_RPC_URL ||
    (String(config.network).includes('devnet')
      ? 'https://api.devnet.solana.com'
      : 'https://api.mainnet-beta.solana.com');

  cachedConnection = new Connection(endpoint, config.commitment || 'confirmed');
  return cachedConnection;
}

function resolveCommitment() {
  return config.confirmation.commitment || config.commitment || 'confirmed';
}

function resolveTimeout() {
  return config.confirmation.timeoutMs || ACTIONS_CONFIRMATION_TIMEOUT_MS;
}

function resolvePollInterval() {
  return config.confirmation.pollIntervalMs || ACTIONS_CONFIRMATION_POLL_INTERVAL_MS;
}

function resolveMaxAttempts() {
  return config.confirmation.maxPollAttempts || ACTIONS_CONFIRMATION_MAX_POLL_ATTEMPTS;
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
  const commitment = resolveCommitment();
  const transaction = await connection.getTransaction(signature, {
    commitment,
    maxSupportedTransactionVersion: 0,
  });
  return transaction;
}

async function pollForConfirmation(signature, { commitment = resolveCommitment() } = {}) {
  const timeoutAt = Date.now() + resolveTimeout();
  const maxAttempts = resolveMaxAttempts();
  const pollInterval = resolvePollInterval();

  let attempt = 0;
  let lastError = null;

  while (Date.now() < timeoutAt && attempt < maxAttempts) {
    attempt += 1;

    try {
      const status = await fetchSignatureStatus(signature);

      if (status) {
        if (status.err) {
          throw new ConfirmationFailedError('Transaction failed on-chain', {
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
      if (error instanceof ConfirmationFailedError) {
        throw error;
      }
      lastError = error;
    }

    await sleep(pollInterval);
  }

  if (lastError) {
    throw new ServiceUnavailableError('Confirmation polling failed', {
      signature,
      reason: lastError.message,
    });
  }

  throw new ConfirmationTimeoutError('Transaction confirmation timed out', {
    signature,
    attempts: attempt,
    timeoutMs: resolveTimeout(),
  });
}

async function verify({ signature, commitment }) {
  if (!signature) {
    throw new ConfirmationFailedError('Signature is required');
  }

  const result = await pollForConfirmation(signature, { commitment });

  let transaction = null;
  try {
    transaction = await fetchTransaction(signature);
  } catch (_error) {
    transaction = null;
  }

  return {
    signature,
    confirmed: result.confirmed,
    slot: result.slot,
    confirmationStatus: result.confirmationStatus,
    attempts: result.attempts,
    transaction,
  };
}

async function waitForFinalized(signature) {
  return pollForConfirmation(signature, { commitment: 'finalized' });
}

function clearConnectionCache() {
  cachedConnection = null;
}

function toPublicKey(address) {
  return new PublicKey(address);
}

module.exports = {
  getConnection,
  resolveCommitment,
  resolveTimeout,
  resolvePollInterval,
  resolveMaxAttempts,
  fetchSignatureStatus,
  fetchTransaction,
  pollForConfirmation,
  verify,
  waitForFinalized,
  clearConnectionCache,
  toPublicKey,
};