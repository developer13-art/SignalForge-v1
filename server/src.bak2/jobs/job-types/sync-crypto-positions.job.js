'use strict';

const gatewayRegistry = require('../../modules/execution/gateways/shared/gateway-registry.service');

/**
 * Job: SYNC_CRYPTO_POSITIONS
 *
 * Syncs a user's perpetual positions from a specific gateway. The
 * payload carries the gateway key and the user's wallet or account
 * identifier.
 */

module.exports = {
  name: 'SYNC_CRYPTO_POSITIONS',

  async execute(payload = {}) {
    const { gateway, userId, user } = payload;

    if (!gateway) {
      throw new Error('SYNC_CRYPTO_POSITIONS requires gateway');
    }
    if (!userId || !user) {
      throw new Error('SYNC_CRYPTO_POSITIONS requires userId and user');
    }

    const resolved = await gatewayRegistry.getGateway(gateway);

    if (typeof resolved.syncPositions !== 'function') {
      throw new Error(`Gateway ${gateway} does not support position sync`);
    }

    const result = await resolved.syncPositions({ userId, user });
    return result;
  },

  schedule: '*/3 * * * *',

  retry: {
    maxAttempts: 3,
    backoffMs: [5000, 15000, 60000],
  },

  timeoutMs: 180000,
};