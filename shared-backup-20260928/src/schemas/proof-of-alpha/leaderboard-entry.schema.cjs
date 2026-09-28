'use strict';

const {
  PROOF_LEADERBOARD_WINDOWS,
  PROOF_LEADERBOARD_SORTS,
  PROOF_VERIFICATION_LEVELS,
} = require('../../constants/proof-of-alpha');

/**
 * SignalForge - Leaderboard Entry Schema
 */

const LEADERBOARD_ENTRY_SCHEMA = Object.freeze({
  type: 'object',
  required: ['providerId', 'rank', 'window', 'sortBy'],
  properties: {
    providerId: { type: 'string' },
    providerName: { type: ['string', 'null'] },
    providerAvatarUrl: { type: ['string', 'null'] },
    rank: { type: 'integer', minimum: 1 },
    window: { type: 'string', enum: Object.values(PROOF_LEADERBOARD_WINDOWS) },
    sortBy: { type: 'string', enum: Object.values(PROOF_LEADERBOARD_SORTS) },
    totalTrades: { type: 'integer', minimum: 0 },
    winningTrades: { type: 'integer', minimum: 0 },
    losingTrades: { type: 'integer', minimum: 0 },
    breakEvenTrades: { type: 'integer', minimum: 0 },
    winRate: { type: 'number' },
    totalPnlUsd: { type: 'number' },
    averagePnlPercent: { type: 'number' },
    profitFactor: { type: 'number' },
    verifiedTrades: { type: 'integer', minimum: 0 },
    verificationLevel: {
      type: 'string',
      enum: Object.values(PROOF_VERIFICATION_LEVELS),
    },
    lastVerifiedAt: { type: ['string', 'null'], format: 'date-time' },
    consistencyScore: { type: ['number', 'null'] },
    sharpeLike: { type: ['number', 'null'] },
  },
  additionalProperties: true,
});

function validateLeaderboardEntry(entry) {
  const errors = [];

  if (!entry || typeof entry !== 'object') {
    return { valid: false, errors: ['entry must be an object'] };
  }

  if (!entry.providerId) {
    errors.push('providerId is required');
  }

  if (typeof entry.rank !== 'number' || entry.rank < 1) {
    errors.push('rank must be a positive integer');
  }

  if (!Object.values(PROOF_LEADERBOARD_WINDOWS).includes(entry.window)) {
    errors.push('window must be a supported leaderboard window');
  }

  if (!Object.values(PROOF_LEADERBOARD_SORTS).includes(entry.sortBy)) {
    errors.push('sortBy must be a supported leaderboard sort');
  }

  return { valid: errors.length === 0, errors };
}

function buildLeaderboardEntry(row, { window, sortBy } = {}) {
  return {
    providerId: row.provider_id,
    providerName: row.provider_name || null,
    providerAvatarUrl: row.provider_avatar_url || null,
    rank: row.rank,
    window,
    sortBy,
    totalTrades: row.total_trades || 0,
    winningTrades: row.winning_trades || 0,
    losingTrades: row.losing_trades || 0,
    breakEvenTrades: row.break_even_trades || 0,
    winRate: row.win_rate || 0,
    totalPnlUsd: row.total_pnl_usd || 0,
    averagePnlPercent: row.average_pnl_percent || 0,
    profitFactor: row.profit_factor || 0,
    verifiedTrades: row.verified_trades || 0,
    verificationLevel: row.verification_level || PROOF_VERIFICATION_LEVELS.UNVERIFIED,
    lastVerifiedAt: row.last_verified_at || null,
    consistencyScore: row.consistency_score || null,
    sharpeLike: row.sharpe_like || null,
  };
}

module.exports = {
  LEADERBOARD_ENTRY_SCHEMA,
  validateLeaderboardEntry,
  buildLeaderboardEntry,
};