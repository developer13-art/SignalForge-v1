'use strict';

const confirmationService = require('../../modules/solana/actions/confirmations/confirmation.service');
const confirmationReconciler = require('../../modules/solana/actions/confirmations/confirmation-reconciler.service');

/**
 * Job: PROCESS_BLINK_CONFIRMATION
 *
 * Processes a single Blink confirmation. The payload carries either
 * a confirmationId, a signature, or both. If neither is present the
 * job fails without changing state.
 */

module.exports = {
  name: 'PROCESS_BLINK_CONFIRMATION',

  async execute(payload = {}, context = {}) {
    const { confirmationId, signature, commitment } = payload;
    const requestId = context.requestId || null;

    if (!confirmationId && !signature) {
      throw new Error('PROCESS_BLINK_CONFIRMATION requires confirmationId or signature');
    }

    const result = await confirmationService.confirmSignature({
      confirmationId,
      signature,
      commitment,
      requestId,
    });

    return {
      confirmationId,
      signature,
      status: result.confirmation ? result.confirmation.status : 'confirmed',
      subscription: result.subscription || null,
      referralRelationship: result.referralRelationship || null,
    };
  },

  async reconcile(payload = {}) {
    return confirmationReconciler.reconcileSignature(payload.signature, {
      commitment: payload.commitment,
    });
  },

  retry: {
    maxAttempts: 5,
    backoffMs: [2000, 5000, 15000, 30000, 60000],
  },

  timeoutMs: 120000,
};