'use strict';

const leaderboardService = require('../../modules/solana/proof-of-alpha/leaderboard/leaderboard.service');

/**
 * Job: REFRESH_LEADERBOARD_CACHE
 *
 * Rebuilds the on-chain leaderboard cache for a window and sort
 * combination. When no window is provided, refreshes every window
 * and sort.
 */

module.exports = {
  name: 'REFRESH_LEADERBOARD_CACHE',

  async execute(payload = {}, context = {}) {
    const { window, sortBy } = payload;
    const requestId = context.requestId || null;

    if (!window) {
      const result = await leaderboardService.refreshAllLeaderboards({
        requestId,
        generatedBy: 'scheduled',
      });
      return result;
    }

    const result = await leaderboardService.refreshLeaderboard({
      window,
      sortBy,
      requestId,
      generatedBy: 'scheduled',
    });

    return result;
  },

  schedule: '*/5 * * * *',

  retry: {
    maxAttempts: 3,
    backoffMs: [5000, 15000, 60000],
  },

  timeoutMs: 300000,
};