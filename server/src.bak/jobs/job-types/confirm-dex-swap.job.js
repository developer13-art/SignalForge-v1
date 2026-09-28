'use strict';

const gatewayRegistry = require('../../modules/execution/gateways/shared/gateway-registry.service');

/**
 * Job: CONFIRM_DEX_SWAP
 *
 * Confirms a DEX swap by delegating to the gateway that built it.
 * The payload carries the gateway key, swapId, and signature.
 */

module.exports = {
  name: 'CONFIRM_DEX_SWAP',

  async execute(payload = {}, context = {}) {
    const { gateway, swapId, signature } = payload;
    const requestId = context.requestId || null;

    if (!gateway) {
      throw new Error('CONFIRM_DEX_SWAP requires gateway');
    }
    if (!swapId && !signature) {
      throw new Error('CONFIRM_DEX_SWAP requires swapId or signature');
    }

    const resolved = await gatewayRegistry.getGateway(gateway);

    if (typeof resolved.confirm !== 'function') {
      throw new Error(`Gateway ${gateway} does not support confirm`);
    }

    const result = await resolved.confirm({ swapId, signature, requestId });

    return result;
  },

  retry: {
    maxAttempts: 5,
    backoffMs: [2500, 5000, 15000, 30000, 60000],
  },

  timeoutMs: 180000,
};