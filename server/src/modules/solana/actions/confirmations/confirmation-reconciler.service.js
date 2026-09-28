'use strict';

const confirmationService = require('./confirmation.service');
const confirmationVerifier = require('./confirmation-verifier.service');
const confirmationRepository = require('./confirmation.repository');

const { config } = require('../actions.config');
const {
  ACTIONS_CONFIRMATION_MAX_POLL_ATTEMPTS,
  ACTIONS_BLINK_CONVERSION_STATUSES,
} = require('../actions.constants');

/**
 * SignalForge - Confirmation Reconciler Service
 *
 * Periodically scans for confirmations that are still in a pending or
 * processing state, re-verifies them against the RPC provider, and
 * transitions them to a terminal state. This service is invoked by
 * the scheduler so that no payment is ever left ambiguous after a
 * webhook is lost or delayed.
 */

const DEFAULT_STALE_THRESHOLD_MS = 5 * 60 * 1000;
const DEFAULT_BATCH_SIZE = 50;

async function reconcilePending({ commitment, staleThresholdMs, batchSize } = {}) {
  const pending = await confirmationRepository.listPending({
    commitment: commitment || config.commitment,
    olderThanMs: staleThresholdMs || DEFAULT_STALE_THRESHOLD_MS,
    limit: batchSize || DEFAULT_BATCH_SIZE,
  });

  const results = [];

  for (const confirmation of pending) {
    try {
      const verification = await confirmationVerifier.verify({
        signature: confirmation.signature,
        commitment,
      });

      if (verification.confirmed) {
        const result = await confirmationService.confirmSignature({
          signature: confirmation.signature,
          blinkId: confirmation.blink_id,
          conversionId: confirmation.conversion_id,
          wallet: confirmation.wallet,
          amount: confirmation.amount,
          tokenSymbol: confirmation.token_symbol,
          tokenMint: confirmation.token_mint,
          reference: confirmation.reference,
          requestId: null,
          commitment,
        });

        results.push({
          confirmationId: confirmation.id,
          signature: confirmation.signature,
          result: 'confirmed',
          subscription: result.subscription || null,
        });
      } else {
        results.push({
          confirmationId: confirmation.id,
          signature: confirmation.signature,
          result: 'pending',
        });
      }
    } catch (error) {
      if (error.name === 'ConfirmationTimeoutError') {
        const attempts = (confirmation.raw_payload && confirmation.raw_payload.attempts) || 0;

        if (attempts >= ACTIONS_CONFIRMATION_MAX_POLL_ATTEMPTS) {
          await confirmationRepository.updateStatus(confirmation.id, {
            status: 'expired',
            errorMessage: 'Confirmation exceeded maximum polling attempts',
          });

          results.push({
            confirmationId: confirmation.id,
            signature: confirmation.signature,
            result: 'expired',
          });
        } else {
          await confirmationRepository.updateStatus(confirmation.id, {
            status: 'pending',
            rawPayload: {
              ...(confirmation.raw_payload || {}),
              attempts: attempts + 1,
            },
          });

          results.push({
            confirmationId: confirmation.id,
            signature: confirmation.signature,
            result: 'retry_scheduled',
          });
        }
      } else {
        await confirmationRepository.updateStatus(confirmation.id, {
          status: 'failed',
          errorMessage: error.message,
        });

        if (confirmation.conversion_id) {
          const { query } = require('../../../../database/connection');
          await query(
            `UPDATE solana_blink_conversions
             SET status = $2, updated_at = NOW()
             WHERE id = $1`,
            [confirmation.conversion_id, ACTIONS_BLINK_CONVERSION_STATUSES.FAILED],
          );
        }

        results.push({
          confirmationId: confirmation.id,
          signature: confirmation.signature,
          result: 'failed',
          error: error.message,
        });
      }
    }
  }

  return {
    scanned: pending.length,
    results,
  };
}

async function reconcileSignature(signature, options = {}) {
  const confirmation = await confirmationRepository.findBySignature(signature);

  if (!confirmation) {
    return {
      signature,
      reconciled: false,
      reason: 'not_found',
    };
  }

  if (confirmation.status === 'confirmed' || confirmation.status === 'failed') {
    return {
      signature,
      reconciled: false,
      reason: 'already_final',
      status: confirmation.status,
    };
  }

  try {
    const result = await confirmationService.confirmSignature({
      signature,
      blinkId: confirmation.blink_id,
      conversionId: confirmation.conversion_id,
      wallet: confirmation.wallet,
      amount: confirmation.amount,
      tokenSymbol: confirmation.token_symbol,
      tokenMint: confirmation.token_mint,
      reference: confirmation.reference,
      requestId: null,
      commitment: options.commitment || config.commitment,
    });

    return {
      signature,
      reconciled: true,
      status: 'confirmed',
      subscription: result.subscription || null,
    };
  } catch (error) {
    return {
      signature,
      reconciled: false,
      status: 'failed',
      error: error.message,
    };
  }
}

async function reconcileExpired({ olderThanMs } = {}) {
  const pending = await confirmationRepository.listPending({
    olderThanMs: olderThanMs || 30 * 60 * 1000,
    limit: 500,
  });

  let expiredCount = 0;

  for (const confirmation of pending) {
    const attempts = (confirmation.raw_payload && confirmation.raw_payload.attempts) || 0;
    if (attempts >= ACTIONS_CONFIRMATION_MAX_POLL_ATTEMPTS) {
      await confirmationRepository.updateStatus(confirmation.id, {
        status: 'expired',
        errorMessage: 'Confirmation exceeded the maximum allowed attempts',
      });
      expiredCount += 1;
    }
  }

  return {
    scanned: pending.length,
    expired: expiredCount,
  };
}

module.exports = {
  DEFAULT_STALE_THRESHOLD_MS,
  DEFAULT_BATCH_SIZE,
  reconcilePending,
  reconcileSignature,
  reconcileExpired,
};