'use strict';

const crypto = require('crypto');

const leaderboardRepository = require('./leaderboard.repository');
const leaderboardAggregator = require('./leaderboard-aggregator.service');
const leaderboardRanker = require('./leaderboard-ranker.service');
const leaderboardFilter = require('./leaderboard-filter.service');
const leaderboardCache = require('./leaderboard-cache.service');
const leaderboardVerified = require('./leaderboard-verified.service');

const {
  PROOF_LEADERBOARD_WINDOWS,
  PROOF_LEADERBOARD_SORTS,
} = require('../proof.constants');

const {
  ServiceUnavailableError,
} = require('../proof.errors');

const {
  buildLeaderboardRefreshedEvent,
} = require('../proof.events');

const { config } = require('../proof.config');

/**
 * SignalForge - Leaderboard Service
 *
 * Orchestrates refresh, retrieval, and verification of the on-chain
 * leaderboard. Reads prefer the cache; writes replace the cache atomically
 * and record a history entry. All public reads are tenant-agnostic so
 * that the leaderboard can be shown on the marketing site.
 */

function emitEvent(name, payload) {
  const bus = global.__signalforgeEventBus;
  if (bus && typeof bus.publish === 'function') {
    bus.publish(name, payload);
  }
}

async function ensureEnabled() {
  if (!config.enabled) {
    throw new ServiceUnavailableError('Proof of Alpha is currently disabled');
  }
  if (!config.featureFlags.leaderboardEnabled) {
    throw new ServiceUnavailableError('The on-chain leaderboard is currently disabled');
  }
}

async function refreshLeaderboard({ window, sortBy, requestId, generatedBy } = {}) {
  await ensureEnabled();

  const normalizedWindow = leaderboardFilter.normalizeWindow(window);
  const normalizedSort = leaderboardFilter.normalizeSortBy(sortBy);

  const start = Date.now();

  const aggregates = await leaderboardAggregator.getLeaderboardAggregates({
    window: normalizedWindow,
  });

  const ranked = leaderboardRanker.rank(aggregates, {
    sortBy: normalizedSort,
    minTrades: 0,
  });

  const stored = await leaderboardRepository.replaceCache({
    window: normalizedWindow,
    sortBy: normalizedSort,
    rows: ranked,
  });

  const durationMs = Date.now() - start;

  await leaderboardCache.recordRefresh({
    window: normalizedWindow,
    sortBy: normalizedSort,
    count: stored.length,
    durationMs,
    generatedBy: generatedBy || 'system',
  });

  emitEvent(
    'solana.proof.leaderboard.refreshed',
    buildLeaderboardRefreshedEvent({
      window: normalizedWindow,
      count: stored.length,
      sortBy: normalizedSort,
      requestId,
    }).payload,
  );

  return {
    window: normalizedWindow,
    sortBy: normalizedSort,
    count: stored.length,
    durationMs,
    generatedAt: new Date().toISOString(),
    rows: stored,
  };
}

async function getLeaderboard({
  window,
  sortBy,
  limit,
  offset,
  minTrades,
  minWinRate,
  minProfitFactor,
  minPnl,
  verifiedOnly,
  providerId,
  requestId,
  forceRefresh = false,
} = {}) {
  await ensureEnabled();

  const filters = leaderboardFilter.normalizeFilters({
    window,
    sortBy,
    limit,
    offset,
    minTrades,
    minWinRate,
    minProfitFactor,
    minPnl,
    verifiedOnly,
    providerId,
  });

  const cacheFresh = await leaderboardCache.isFresh({
    window: filters.window,
    sortBy: filters.sortBy,
  });

  if (!cacheFresh || forceRefresh) {
    await refreshLeaderboard({
      window: filters.window,
      sortBy: filters.sortBy,
      requestId,
      generatedBy: 'read',
    });
  }

  const cached = await leaderboardRepository.listCache({
    window: filters.window,
    sortBy: filters.sortBy,
    limit: 500,
    offset: 0,
  });

  const filtered = leaderboardFilter.applyFilters(cached, filters);
  const paginated = leaderboardFilter.paginate(filtered, {
    limit: filters.limit,
    offset: filters.offset,
  });

  const summary = leaderboardRanker.summarize(filtered);

  const lastRefresh = await leaderboardCache.lastRefresh({
    window: filters.window,
    sortBy: filters.sortBy,
  });

  return {
    window: filters.window,
    sortBy: filters.sortBy,
    limit: filters.limit,
    offset: filters.offset,
    total: filtered.length,
    rows: paginated.map((row) => ({
      ...row,
      rank: row.rank,
      providerId: row.provider_id,
      providerName: row.provider_name || null,
      providerAvatarUrl: row.provider_avatar_url || null,
      totalTrades: row.total_trades,
      winningTrades: row.winning_trades,
      losingTrades: row.losing_trades,
      breakEvenTrades: row.break_even_trades,
      winRate: row.win_rate,
      totalPnlUsd: row.total_pnl_usd,
      averagePnlPercent: row.average_pnl_percent,
      profitFactor: row.profit_factor,
      verifiedTrades: row.verified_trades,
      verificationLevel: row.verification_level,
      lastVerifiedAt: row.last_verified_at,
      consistencyScore: row.consistency_score || null,
      sharpeLike: row.sharpe_like || null,
    })),
    summary,
    cache: {
      fresh: cacheFresh,
      lastRefreshedAt: lastRefresh ? lastRefresh.created_at : null,
      ttlSeconds: leaderboardCache.getTtlSeconds(),
    },
  };
}

async function getLeaderboardEntry({ providerId, window, sortBy } = {}) {
  await ensureEnabled();

  const normalizedWindow = leaderboardFilter.normalizeWindow(window);
  const normalizedSort = leaderboardFilter.normalizeSortBy(sortBy);

  const cacheFresh = await leaderboardCache.isFresh({
    window: normalizedWindow,
    sortBy: normalizedSort,
  });

  if (!cacheFresh) {
    await refreshLeaderboard({
      window: normalizedWindow,
      sortBy: normalizedSort,
      generatedBy: 'entry-lookup',
    });
  }

  const entry = await leaderboardRepository.findEntry({
    window: normalizedWindow,
    sortBy: normalizedSort,
    providerId,
  });

  if (!entry) {
    return null;
  }

  return {
    ...entry,
    providerId: entry.provider_id,
    providerName: entry.provider_name,
  };
}

async function getTopProviders({ window, limit } = {}) {
  const result = await getLeaderboard({
    window: window || PROOF_LEADERBOARD_WINDOWS.MONTH,
    sortBy: PROOF_LEADERBOARD_SORTS.TOTAL_PNL,
    limit: limit || 10,
    offset: 0,
  });

  return result.rows;
}

async function refreshAllLeaderboards({ requestId, generatedBy } = {}) {
  await ensureEnabled();

  const windows = Object.values(PROOF_LEADERBOARD_WINDOWS);
  const sorts = [
    PROOF_LEADERBOARD_SORTS.TOTAL_PNL,
    PROOF_LEADERBOARD_SORTS.WIN_RATE,
    PROOF_LEADERBOARD_SORTS.PROFIT_FACTOR,
    PROOF_LEADERBOARD_SORTS.AVERAGE_RR,
    PROOF_LEADERBOARD_SORTS.VERIFIED_TRADES,
    PROOF_LEADERBOARD_SORTS.CONSISTENCY,
  ];

  const results = [];

  for (const window of windows) {
    for (const sortBy of sorts) {
      try {
        const result = await refreshLeaderboard({
          window,
          sortBy,
          requestId,
          generatedBy: generatedBy || 'scheduled',
        });
        results.push({
          window,
          sortBy,
          count: result.count,
          durationMs: result.durationMs,
          success: true,
        });
      } catch (error) {
        results.push({
          window,
          sortBy,
          success: false,
          error: error.message,
        });
      }
    }
  }

  const succeeded = results.filter((entry) => entry.success).length;

  return {
    total: results.length,
    succeeded,
    failed: results.length - succeeded,
    results,
  };
}

async function getProviderVerification({ providerId, window } = {}) {
  await ensureEnabled();
  return leaderboardVerified.verifyProvider({ providerId, window });
}

async function getProviderBadge({ providerId } = {}) {
  await ensureEnabled();
  return leaderboardVerified.getVerificationBadge({ providerId });
}

async function summarizeLeaderboard({ window, sortBy } = {}) {
  await ensureEnabled();

  const normalizedWindow = leaderboardFilter.normalizeWindow(window);
  const normalizedSort = leaderboardFilter.normalizeSortBy(sortBy);

  const rows = await leaderboardRepository.listCache({
    window: normalizedWindow,
    sortBy: normalizedSort,
    limit: 500,
    offset: 0,
  });

  return {
    window: normalizedWindow,
    sortBy: normalizedSort,
    summary: leaderboardRanker.summarize(rows),
    cache: await leaderboardCache.getCacheHealth(),
  };
}

async function clearLeaderboardCache({ window, sortBy } = {}) {
  await ensureEnabled();
  const removed = await leaderboardCache.invalidate({ window, sortBy });
  return { removed };
}

function generateLeaderboardId() {
  return `lb_${crypto.randomBytes(8).toString('hex')}`;
}

module.exports = {
  ensureEnabled,
  refreshLeaderboard,
  getLeaderboard,
  getLeaderboardEntry,
  getTopProviders,
  refreshAllLeaderboards,
  getProviderVerification,
  getProviderBadge,
  summarizeLeaderboard,
  clearLeaderboardCache,
  generateLeaderboardId,
};