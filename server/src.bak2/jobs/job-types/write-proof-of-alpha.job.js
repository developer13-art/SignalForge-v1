'use strict';

const proofService = require('../../modules/solana/proof-of-alpha/proof.service');

/**
 * Job: WRITE_PROOF_OF_ALPHA
 *
 * Writes a Proof of Alpha memo for a closed provider trade. The
 * payload carries the trade details needed to build and submit the
 * memo transaction.
 */

module.exports = {
  name: 'WRITE_PROOF_OF_ALPHA',

  async execute(payload = {}, context = {}) {
    const {
      providerId,
      tradeId,
      symbol,
      direction,
      pnlUsd,
      pnlPercent,
      openedAt,
      closedAt,
      confidence,
      signalId,
    } = payload;

    const requestId = context.requestId || null;

    if (!providerId || !tradeId) {
      throw new Error('WRITE_PROOF_OF_ALPHA requires providerId and tradeId');
    }

    const result = await proofService.writeTradeCloseProof({
      providerId,
      tradeId,
      symbol,
      direction,
      pnlUsd,
      pnlPercent,
      openedAt,
      closedAt,
      confidence,
      signalId,
      requestId,
    });

    return result;
  },

  retry: {
    maxAttempts: 5,
    backoffMs: [2000, 5000, 15000, 30000, 60000],
  },

  timeoutMs: 120000,
};