'use strict';

const tokenMetadata = require('../../modules/market-data/crypto/token-metadata.service');

/**
 * Job: SYNC_TOKENS
 *
 * Refreshes the token metadata cache for a set of mints. Used to
 * keep metadata fresh when new tokens are discovered or when the
 * upstream token list changes.
 */

module.exports = {
  name: 'SYNC_TOKENS',

  async execute(payload = {}) {
    const { mints } = payload;

    if (!Array.isArray(mints) || mints.length === 0) {
      throw new Error('SYNC_TOKENS requires a non-empty mints array');
    }

    const results = [];

    for (const mint of mints) {
      try {
        const metadata = await tokenMetadata.fetchMetadata({ mint, persist: true });
        results.push({ mint, metadata, success: true });
      } catch (error) {
        results.push({
          mint,
          success: false,
          error: error.message,
          code: error.code,
        });
      }
    }

    const succeeded = results.filter((entry) => entry.success).length;
    const failed = results.length - succeeded;

    return {
      total: results.length,
      succeeded,
      failed,
      results,
    };
  },

  schedule: '0 */3 * * *',

  retry: {
    maxAttempts: 3,
    backoffMs: [10000, 30000, 90000],
  },

  timeoutMs: 300000,
};