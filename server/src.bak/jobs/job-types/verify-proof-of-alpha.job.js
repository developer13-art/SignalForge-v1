'use strict';

const proofService = require('../../modules/solana/proof-of-alpha/proof.service');
const proofState = require('../../modules/solana/proof-of-alpha/verification/proof-state.service');

/**
 * Job: VERIFY_PROOF_OF_ALPHA
 *
 * Verifies a proof by signature against the on-chain memo. Updates
 * the proof state and emits the corresponding events.
 */

module.exports = {
  name: 'VERIFY_PROOF_OF_ALPHA',

  async execute(payload = {}, context = {}) {
    const { signature, proofId } = payload;
    const requestId = context.requestId || null;

    if (!signature && !proofId) {
      throw new Error('VERIFY_PROOF_OF_ALPHA requires signature or proofId');
    }

    if (signature) {
      const result = await proofService.verifyProofBySignature(signature, { requestId });
      return result;
    }

    const state = await proofState.getProofState(proofId);
    return state;
  },

  retry: {
    maxAttempts: 5,
    backoffMs: [2000, 5000, 15000, 30000, 60000],
  },

  timeoutMs: 120000,
};