'use strict';

/**
 * SignalForge - Proof of Alpha Leaderboard Sort Constants
 */

const PROOF_LEADERBOARD_WINDOWS = Object.freeze({
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
  QUARTER: 'quarter',
  YEAR: 'year',
  ALL: 'all',
});

const PROOF_LEADERBOARD_WINDOW_LABELS = Object.freeze({
  day: 'Last 24 hours',
  week: 'Last 7 days',
  month: 'Last 30 days',
  quarter: 'Last 90 days',
  year: 'Last 12 months',
  all: 'All time',
});

const PROOF_LEADERBOARD_SORTS = Object.freeze({
  TOTAL_PNL: 'total_pnl',
  WIN_RATE: 'win_rate',
  PROFIT_FACTOR: 'profit_factor',
  AVERAGE_RR: 'average_rr',
  CONSISTENCY: 'consistency',
  SHARPE: 'sharpe',
  VERIFIED_TRADES: 'verified_trades',
});

const PROOF_LEADERBOARD_SORT_LABELS = Object.freeze({
  total_pnl: 'Total PnL',
  win_rate: 'Win Rate',
  profit_factor: 'Profit Factor',
  average_rr: 'Average RR',
  consistency: 'Consistency',
  sharpe: 'Sharpe Ratio',
  verified_trades: 'Verified Trades',
});

const PROOF_LEADERBOARD_SORT_DESCRIPTIONS = Object.freeze({
  total_pnl: 'Ranked by the sum of realized profit and loss in USD.',
  win_rate: 'Ranked by the percentage of profitable trades.',
  profit_factor: 'Ranked by the ratio of gross profit to gross loss.',
  average_rr: 'Ranked by average risk-reward realized on closed trades.',
  consistency: 'Ranked by a composite score of participation, win rate, and positive bias.',
  sharpe: 'Ranked by a Sharpe-like score computed from average return and loss risk.',
  verified_trades: 'Ranked by the number of on-chain confirmed trades.',
});

const PROOF_LEADERBOARD_DEFAULT_LIMIT = 50;
const PROOF_LEADERBOARD_MAX_LIMIT = 200;

module.exports = Object.freeze({
  PROOF_LEADERBOARD_WINDOWS,
  PROOF_LEADERBOARD_WINDOW_LABELS,
  PROOF_LEADERBOARD_SORTS,
  PROOF_LEADERBOARD_SORT_LABELS,
  PROOF_LEADERBOARD_SORT_DESCRIPTIONS,
  PROOF_LEADERBOARD_DEFAULT_LIMIT,
  PROOF_LEADERBOARD_MAX_LIMIT,
});