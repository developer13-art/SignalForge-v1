'use strict';

const confirmationReconciler = require('../../modules/solana/actions/confirmations/confirmation-reconciler.service');

/**
 * Job: RECONCILE_BLINK_PAYMENTS
 *
 * Periodic reconciliation of pending Blink payments. Scans for
 * confirmations that are still in a pending state and re-verifies
 * them against the Solana RPC.
 */

module.exports = {
  name: 'RECONCILE_BLINK_PAYMENTS',

  async execute(payload = {}) {
    const { commitment, staleThresholdMs, batchSize } = payload;

    const pending = await confirmationReconciler.reconcilePending({
      commitment,
      staleThresholdMs,
      batchSize,
    });

    const expired = await confirmationReconciler.reconcileExpired({
      olderThanMs: staleThresholdMs,
    });

    return {
      pending,
      expired,
    };
  },

  schedule: '*/2 * * * *',

  retry: {
    maxAttempts: 3,
    backoffMs: [5000, 15000, 60000],
  },

  timeoutMs: 300000,
};