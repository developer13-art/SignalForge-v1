'use strict';

const leaderboardRepository = require('./leaderboard.repository');
const { config } = require('../proof.config');

/**
 * SignalForge - Leaderboard Cache Service
 *
 * Manages freshness and invalidation of the leaderboard cache. The
 * service answers two questions: "is the cache fresh for this window
 * and sort?" and "when was the cache last refreshed?". A short TTL is
 * used so that newly confirmed proofs are reflected quickly without
 * thrashing the database.
 */

function resolveTtl() {
  return config.leaderboard.cacheTtlSeconds || 300;
}

async function isFresh({ window, sortBy } = {}) {
  return leaderboardRepository.isFresh({
    window,
    sortBy,
    ttlSeconds: resolveTtl(),
  });
}

async function lastRefresh({ window, sortBy } = {}) {
  return leaderboardRepository.lastRefresh({ window, sortBy });
}

async function getCacheAgeSeconds({ window, sortBy } = {}) {
  const entry = await leaderboardRepository.lastRefresh({ window, sortBy });
  if (!entry || !entry.created_at) {
    return null;
  }
  const ageMs = Date.now() - new Date(entry.created_at).getTime();
  return Math.max(0, Math.floor(ageMs / 1000));
}

async function shouldRefresh({ window, sortBy, force = false } = {}) {
  if (force) {
    return true;
  }
  const fresh = await isFresh({ window, sortBy });
  return !fresh;
}

async function invalidate({ window, sortBy } = {}) {
  return leaderboardRepository.clearCache({ window, sortBy });
}

async function invalidateAll() {
  return leaderboardRepository.clearCache();
}

async function recordRefresh({ window, sortBy, count, durationMs, generatedBy } = {}) {
  return leaderboardRepository.recordHistory({
    window,
    sortBy,
    count,
    durationMs,
    generatedBy: generatedBy || 'system',
  });
}

async function listRefreshHistory({ window, sortBy, page, pageSize } = {}) {
  return leaderboardRepository.listHistory({ window, sortBy, page, pageSize });
}

async function getCacheHealth() {
  const windows = ['day', 'week', 'month', 'quarter', 'year', 'all'];
  const sorts = ['total_pnl', 'win_rate', 'profit_factor'];

  const entries = [];

  for (const window of windows) {
    for (const sortBy of sorts) {
      const last = await leaderboardRepository.lastRefresh({ window, sortBy });
      const ageSeconds = last
        ? Math.max(0, Math.floor((Date.now() - new Date(last.created_at).getTime()) / 1000))
        : null;
      const fresh = ageSeconds !== null ? ageSeconds <= resolveTtl() : false;

      entries.push({
        window,
        sortBy,
        lastRefreshAt: last ? last.created_at : null,
        ageSeconds,
        fresh,
        count: last ? last.count : 0,
      });
    }
  }

  return {
    ttlSeconds: resolveTtl(),
    entries,
  };
}

function getTtlSeconds() {
  return resolveTtl();
}

module.exports = {
  resolveTtl,
  isFresh,
  lastRefresh,
  getCacheAgeSeconds,
  shouldRefresh,
  invalidate,
  invalidateAll,
  recordRefresh,
  listRefreshHistory,
  getCacheHealth,
  getTtlSeconds,
};