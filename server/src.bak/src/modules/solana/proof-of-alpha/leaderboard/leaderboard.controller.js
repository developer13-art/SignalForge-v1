'use strict';

const leaderboardService = require('./leaderboard.service');
const leaderboardFilter = require('./leaderboard-filter.service');
const { PROOF_LEADERBOARD_WINDOWS, PROOF_LEADERBOARD_SORTS } = require('../proof.constants');

/**
 * SignalForge - Leaderboard HTTP Controller
 *
 * Public read endpoints for the on-chain-verified leaderboard. Writes
 * (refresh, clear) require authentication and are typically performed
 * by internal schedulers or admins.
 */

async function getLeaderboard(req, res, next) {
  try {
    const result = await leaderboardService.getLeaderboard({
      window: req.query.window,
      sortBy: req.query.sortBy,
      limit: req.query.limit,
      offset: req.query.offset,
      minTrades: req.query.minTrades,
      minWinRate: req.query.minWinRate,
      minProfitFactor: req.query.minProfitFactor,
      minPnl: req.query.minPnl,
      verifiedOnly: req.query.verifiedOnly,
      providerId: req.query.providerId,
      requestId: req.requestId || null,
    });

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function getTopProviders(req, res, next) {
  try {
    const limit = Number.parseInt(req.query.limit, 10) || 10;
    const window = req.query.window || PROOF_LEADERBOARD_WINDOWS.MONTH;
    const rows = await leaderboardService.getTopProviders({ window, limit });
    return res.status(200).json({ rows });
  } catch (error) {
    return next(error);
  }
}

async function getLeaderboardEntry(req, res, next) {
  try {
    const providerId = req.params.providerId;
    const entry = await leaderboardService.getLeaderboardEntry({
      providerId,
      window: req.query.window,
      sortBy: req.query.sortBy,
    });

    if (!entry) {
      return res.status(404).json({
        message: 'Provider is not present in the current leaderboard cache',
        error: { code: 'NOT_FOUND' },
      });
    }

    return res.status(200).json(entry);
  } catch (error) {
    return next(error);
  }
}

async function getSummary(req, res, next) {
  try {
    const summary = await leaderboardService.summarizeLeaderboard({
      window: req.query.window,
      sortBy: req.query.sortBy,
    });
    return res.status(200).json(summary);
  } catch (error) {
    return next(error);
  }
}

async function getProviderVerification(req, res, next) {
  try {
    const providerId = req.params.providerId;
    const result = await leaderboardService.getProviderVerification({
      providerId,
      window: req.query.window,
    });
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function getProviderBadge(req, res, next) {
  try {
    const providerId = req.params.providerId;
    const badge = await leaderboardService.getProviderBadge({ providerId });
    return res.status(200).json(badge);
  } catch (error) {
    return next(error);
  }
}

async function refreshLeaderboard(req, res, next) {
  try {
    const window = req.body.window || req.query.window;
    const sortBy = req.body.sortBy || req.query.sortBy;

    const result = await leaderboardService.refreshLeaderboard({
      window,
      sortBy,
      requestId: req.requestId || null,
      generatedBy: req.user ? `user:${req.user.id}` : 'api',
    });

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function refreshAll(req, res, next) {
  try {
    const result = await leaderboardService.refreshAllLeaderboards({
      requestId: req.requestId || null,
      generatedBy: req.user ? `user:${req.user.id}` : 'api',
    });
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function clearCache(req, res, next) {
  try {
    const result = await leaderboardService.clearLeaderboardCache({
      window: req.body.window || req.query.window,
      sortBy: req.body.sortBy || req.query.sortBy,
    });
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function listFilters(req, res, next) {
  try {
    const filters = leaderboardFilter.normalizeFilters(req.query || {});
    return res.status(200).json({
      filters,
      availableWindows: Object.values(PROOF_LEADERBOARD_WINDOWS),
      availableSorts: Object.values(PROOF_LEADERBOARD_SORTS),
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getLeaderboard,
  getTopProviders,
  getLeaderboardEntry,
  getSummary,
  getProviderVerification,
  getProviderBadge,
  refreshLeaderboard,
  refreshAll,
  clearCache,
  listFilters,
};