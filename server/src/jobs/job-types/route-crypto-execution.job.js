'use strict';

const executionRouter = require('../../modules/execution/routers/execution-router.service');

/**
 * Job: ROUTE_CRYPTO_EXECUTION
 *
 * Resolves the execution route for a crypto signal. The result is
 * consumed by the execution pipeline. This job is intentionally
 * side-effect free: it never submits orders.
 */

module.exports = {
  name: 'ROUTE_CRYPTO_EXECUTION',

  async execute(payload = {}, context = {}) {
    const requestId = context.requestId || null;
    const { symbol, orderType, direction, userId, accountId, providerId } = payload;

    if (!symbol) {
      throw new Error('ROUTE_CRYPTO_EXECUTION requires symbol');
    }

    const resolution = await executionRouter.resolveRoute({
      payload: {
        symbol,
        orderType: orderType || 'market',
        direction: direction || 'BUY',
        userId,
        accountId,
        providerId,
      },
      context: {
        account: payload.account || null,
        kycVerified: payload.kycVerified === true,
      },
      requestId,
    });

    return resolution;
  },

  retry: {
    maxAttempts: 3,
    backoffMs: [2000, 5000, 15000],
  },

  timeoutMs: 60000,
};