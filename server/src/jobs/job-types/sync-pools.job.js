'use strict';

const poolRegistry = require('../../modules/market-data/crypto/pool-registry.service');

/**
 * Job: SYNC_POOLS
 *
 * Syncs the pool registry from a DEX gateway. The payload carries
 * the gateway key. Called on a schedule so that newly deployed pools
 * become visible to the router and the market data cache.
 */

module.exports = {
  name: 'SYNC_POOLS',

  async execute(payload = {}) {
    const { gateway } = payload;

    if (!gateway) {
      throw new Error('SYNC_POOLS requires gateway');
    }

    const result = await poolRegistry.syncFromGateway({ gateway });

    const succeeded = result.filter((entry) => entry.success).length;
    const failed = result.length - succeeded;

    return {
      gateway,
      total: result.length,
      succeeded,
      failed,
      results: result,
    };
  },

  schedule: '0 */2 * * *',

  retry: {
    maxAttempts: 3,
    backoffMs: [10000, 30000, 90000],
  },

  timeoutMs: 600000,
};