'use strict';

const {
  PROOF_LEADERBOARD_SORTS,
} = require('../proof.constants');

/**
 * SignalForge - Leaderboard Ranker Service
 *
 * Produces a deterministic ranking of provider aggregate rows based
 * on the requested sort. Tiebreaks are stable so that repeated
 * refreshes with identical inputs produce identical orderings.
 */

function computeConsistencyScore(row) {
  const total = Number(row.total_trades) || 0;
  const winning = Number(row.winning_trades) || 0;
  const losing = Number(row.losing_trades) || 0;
  const pnl = Number(row.total_pnl_usd) || 0;

  if (total === 0) {
    return 0;
  }

  const participation = Math.min(1, Math.log10(total + 1) / 3);
  const winRate = total > 0 ? winning / total : 0;
  const lossPenalty = total > 0 ? losing / total : 0;
  const positiveBias = pnl > 0 ? 1 : pnl === 0 ? 0.5 : 0;

  const raw = participation * (winRate * 0.6 + positiveBias * 0.3 + (1 - lossPenalty) * 0.1);

  return Math.round(Math.min(100, Math.max(0, raw * 100)) * 100) / 100;
}

function computeSharpeLike(row) {
  const total = Number(row.total_trades) || 0;
  const avgPnl = Number(row.average_pnl_percent) || 0;
  const winRate = Number(row.win_rate) || 0;

  if (total === 0) {
    return 0;
  }

  const winRateFactor = winRate / 100;
  const lossRisk = 1 - winRateFactor;

  const denominator = Math.max(0.01, lossRisk * Math.abs(avgPnl) + 0.01);

  return Math.round((avgPnl / denominator) * 100) / 100;
}

function applySort(rows, sortBy) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return [];
  }

  const normalized = sortBy || PROOF_LEADERBOARD_SORTS.TOTAL_PNL;

  const comparatorMap = {
    [PROOF_LEADERBOARD_SORTS.TOTAL_PNL]: (a, b) =>
      Number(b.total_pnl_usd) - Number(a.total_pnl_usd),
    [PROOF_LEADERBOARD_SORTS.WIN_RATE]: (a, b) =>
      Number(b.win_rate) - Number(a.win_rate),
    [PROOF_LEADERBOARD_SORTS.PROFIT_FACTOR]: (a, b) =>
      Number(b.profit_factor) - Number(a.profit_factor),
    [PROOF_LEADERBOARD_SORTS.AVERAGE_RR]: (a, b) =>
      Number(b.average_pnl_percent) - Number(a.average_pnl_percent),
    [PROOF_LEADERBOARD_SORTS.VERIFIED_TRADES]: (a, b) =>
      Number(b.verified_trades) - Number(a.verified_trades),
    [PROOF_LEADERBOARD_SORTS.CONSISTENCY]: (a, b) =>
      computeConsistencyScore(b) - computeConsistencyScore(a),
    [PROOF_LEADERBOARD_SORTS.SHARPE]: (a, b) =>
      computeSharpeLike(b) - computeSharpeLike(a),
  };

  const comparator = comparatorMap[normalized] || comparatorMap[PROOF_LEADERBOARD_SORTS.TOTAL_PNL];

  const augmented = rows.map((row) => ({
    ...row,
    consistency_score: computeConsistencyScore(row),
    sharpe_like: computeSharpeLike(row),
  }));

  augmented.sort((a, b) => {
    const diff = comparator(a, b);
    if (diff !== 0) {
      return diff;
    }
    return String(a.provider_id || '').localeCompare(String(b.provider_id || ''));
  });

  return augmented;
}

function applyRank(rows) {
  return rows.map((row, index) => ({
    ...row,
    rank: index + 1,
  }));
}

function applyMinimumTradeFilter(rows, minTrades) {
  if (!minTrades || minTrades <= 0) {
    return rows;
  }
  return rows.filter((row) => Number(row.total_trades) >= minTrades);
}

function applySignificanceThreshold(rows, { minWinRate, minProfitFactor, minPnl } = {}) {
  return rows.filter((row) => {
    if (minWinRate !== undefined && Number(row.win_rate) < minWinRate) {
      return false;
    }
    if (minProfitFactor !== undefined && Number(row.profit_factor) < minProfitFactor) {
      return false;
    }
    if (minPnl !== undefined && Number(row.total_pnl_usd) < minPnl) {
      return false;
    }
    return true;
  });
}

function rank(rows, { sortBy, minTrades, filters } = {}) {
  let result = Array.isArray(rows) ? [...rows] : [];
  result = applyMinimumTradeFilter(result, minTrades);
  result = applySignificanceThreshold(result, filters || {});
  result = applySort(result, sortBy);
  result = applyRank(result);
  return result;
}

function topN(rows, n = 50) {
  if (!Array.isArray(rows)) {
    return [];
  }
  return rows.slice(0, n);
}

function summarize(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return {
      totalProviders: 0,
      totalPnlUsd: 0,
      averageWinRate: 0,
      averageProfitFactor: 0,
      verifiedProviders: 0,
    };
  }

  const totalPnlUsd = rows.reduce((sum, row) => sum + Number(row.total_pnl_usd || 0), 0);
  const averageWinRate =
    rows.reduce((sum, row) => sum + Number(row.win_rate || 0), 0) / rows.length;
  const averageProfitFactor =
    rows.reduce((sum, row) => sum + Number(row.profit_factor || 0), 0) / rows.length;
  const verifiedProviders = rows.filter(
    (row) => row.verification_level === 'on_chain_confirmed',
  ).length;

  return {
    totalProviders: rows.length,
    totalPnlUsd: Math.round(totalPnlUsd * 100) / 100,
    averageWinRate: Math.round(averageWinRate * 100) / 100,
    averageProfitFactor: Math.round(averageProfitFactor * 100) / 100,
    verifiedProviders,
  };
}

module.exports = {
  computeConsistencyScore,
  computeSharpeLike,
  applySort,
  applyRank,
  applyMinimumTradeFilter,
  applySignificanceThreshold,
  rank,
  topN,
  summarize,
};