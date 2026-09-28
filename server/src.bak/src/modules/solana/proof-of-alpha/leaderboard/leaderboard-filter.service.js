'use strict';

const {
  PROOF_LEADERBOARD_WINDOWS,
  PROOF_LEADERBOARD_SORTS,
  PROOF_LEADERBOARD_DEFAULT_LIMIT,
  PROOF_LEADERBOARD_MAX_LIMIT,
} = require('../proof.constants');

const {
  InvalidMemoError,
} = require('../proof.errors');

/**
 * SignalForge - Leaderboard Filter Service
 *
 * Normalizes, validates, and applies filter parameters to leaderboard
 * queries. The filter service is the single place where the API layer
 * and the background refresh agree on what a "valid" leaderboard
 * request means.
 */

const DEFAULTS = Object.freeze({
  window: PROOF_LEADERBOARD_WINDOWS.MONTH,
  sortBy: PROOF_LEADERBOARD_SORTS.TOTAL_PNL,
  limit: PROOF_LEADERBOARD_DEFAULT_LIMIT,
  offset: 0,
  minTrades: 0,
  minWinRate: null,
  minProfitFactor: null,
  minPnl: null,
  verifiedOnly: false,
  providerId: null,
});

function normalizeWindow(window) {
  if (!window) {
    return DEFAULTS.window;
  }
  const normalized = String(window).trim().toLowerCase();
  const allowed = Object.values(PROOF_LEADERBOARD_WINDOWS);
  if (!allowed.includes(normalized)) {
    throw new InvalidMemoError(`Unsupported leaderboard window: ${normalized}`, {
      window: normalized,
      allowed,
    });
  }
  return normalized;
}

function normalizeSortBy(sortBy) {
  if (!sortBy) {
    return DEFAULTS.sortBy;
  }
  const normalized = String(sortBy).trim().toLowerCase();
  const allowed = Object.values(PROOF_LEADERBOARD_SORTS);
  if (!allowed.includes(normalized)) {
    throw new InvalidMemoError(`Unsupported leaderboard sort: ${normalized}`, {
      sortBy: normalized,
      allowed,
    });
  }
  return normalized;
}

function normalizeLimit(limit) {
  if (limit === undefined || limit === null || limit === '') {
    return DEFAULTS.limit;
  }
  const parsed = Number.parseInt(limit, 10);
  if (Number.isNaN(parsed) || parsed < 1) {
    return DEFAULTS.limit;
  }
  return Math.min(parsed, PROOF_LEADERBOARD_MAX_LIMIT);
}

function normalizeOffset(offset) {
  if (offset === undefined || offset === null || offset === '') {
    return DEFAULTS.offset;
  }
  const parsed = Number.parseInt(offset, 10);
  if (Number.isNaN(parsed) || parsed < 0) {
    return DEFAULTS.offset;
  }
  return parsed;
}

function normalizeMinTrades(value) {
  if (value === undefined || value === null || value === '') {
    return DEFAULTS.minTrades;
  }
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 0) {
    return DEFAULTS.minTrades;
  }
  return parsed;
}

function normalizePercentage(value, field) {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  const parsed = Number.parseFloat(value);
  if (Number.isNaN(parsed)) {
    throw new InvalidMemoError(`${field} must be a number`);
  }
  if (parsed < 0 || parsed > 100) {
    throw new InvalidMemoError(`${field} must be between 0 and 100`);
  }
  return parsed;
}

function normalizeNumber(value, field) {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  const parsed = Number.parseFloat(value);
  if (Number.isNaN(parsed)) {
    throw new InvalidMemoError(`${field} must be a number`);
  }
  return parsed;
}

function normalizeVerifiedOnly(value) {
  if (value === undefined || value === null || value === '') {
    return DEFAULTS.verifiedOnly;
  }
  if (typeof value === 'boolean') {
    return value;
  }
  const normalized = String(value).trim().toLowerCase();
  return ['true', '1', 'yes', 'on'].includes(normalized);
}

function normalizeProviderId(value) {
  if (!value) {
    return null;
  }
  const trimmed = String(value).trim();
  if (trimmed.length === 0) {
    return null;
  }
  if (trimmed.length > 128) {
    throw new InvalidMemoError('providerId is too long');
  }
  return trimmed;
}

function normalizeFilters(input = {}) {
  return {
    window: normalizeWindow(input.window),
    sortBy: normalizeSortBy(input.sortBy),
    limit: normalizeLimit(input.limit),
    offset: normalizeOffset(input.offset),
    minTrades: normalizeMinTrades(input.minTrades),
    minWinRate: normalizePercentage(input.minWinRate, 'minWinRate'),
    minProfitFactor: normalizeNumber(input.minProfitFactor, 'minProfitFactor'),
    minPnl: normalizeNumber(input.minPnl, 'minPnl'),
    verifiedOnly: normalizeVerifiedOnly(input.verifiedOnly),
    providerId: normalizeProviderId(input.providerId),
  };
}

function applyVerifiedFilter(rows, verifiedOnly) {
  if (!verifiedOnly) {
    return rows;
  }
  return rows.filter((row) => row.verification_level === 'on_chain_confirmed');
}

function applyMinTradesFilter(rows, minTrades) {
  if (!minTrades || minTrades <= 0) {
    return rows;
  }
  return rows.filter((row) => Number(row.total_trades) >= minTrades);
}

function applyMinWinRateFilter(rows, minWinRate) {
  if (minWinRate === null || minWinRate === undefined) {
    return rows;
  }
  return rows.filter((row) => Number(row.win_rate) >= minWinRate);
}

function applyMinProfitFactorFilter(rows, minProfitFactor) {
  if (minProfitFactor === null || minProfitFactor === undefined) {
    return rows;
  }
  return rows.filter((row) => Number(row.profit_factor) >= minProfitFactor);
}

function applyMinPnlFilter(rows, minPnl) {
  if (minPnl === null || minPnl === undefined) {
    return rows;
  }
  return rows.filter((row) => Number(row.total_pnl_usd) >= minPnl);
}

function applyProviderFilter(rows, providerId) {
  if (!providerId) {
    return rows;
  }
  return rows.filter((row) => row.provider_id === providerId);
}

function applyFilters(rows, filters) {
  let result = Array.isArray(rows) ? [...rows] : [];
  result = applyVerifiedFilter(result, filters.verifiedOnly);
  result = applyMinTradesFilter(result, filters.minTrades);
  result = applyMinWinRateFilter(result, filters.minWinRate);
  result = applyMinProfitFactorFilter(result, filters.minProfitFactor);
  result = applyMinPnlFilter(result, filters.minPnl);
  result = applyProviderFilter(result, filters.providerId);
  return result;
}

function paginate(rows, { limit, offset }) {
  if (!Array.isArray(rows)) {
    return [];
  }
  const start = Math.max(0, Number(offset) || 0);
  const end = start + (Number(limit) || PROOF_LEADERBOARD_DEFAULT_LIMIT);
  return rows.slice(start, end);
}

function buildQueryParams(filters) {
  const params = new URLSearchParams();
  params.set('window', filters.window);
  params.set('sortBy', filters.sortBy);
  params.set('limit', String(filters.limit));
  if (filters.offset > 0) {
    params.set('offset', String(filters.offset));
  }
  if (filters.minTrades > 0) {
    params.set('minTrades', String(filters.minTrades));
  }
  if (filters.minWinRate !== null) {
    params.set('minWinRate', String(filters.minWinRate));
  }
  if (filters.minProfitFactor !== null) {
    params.set('minProfitFactor', String(filters.minProfitFactor));
  }
  if (filters.minPnl !== null) {
    params.set('minPnl', String(filters.minPnl));
  }
  if (filters.verifiedOnly) {
    params.set('verifiedOnly', 'true');
  }
  if (filters.providerId) {
    params.set('providerId', filters.providerId);
  }
  return params.toString();
}

function isDefaultFilterSet(filters) {
  return (
    filters.window === DEFAULTS.window &&
    filters.sortBy === DEFAULTS.sortBy &&
    filters.limit === DEFAULTS.limit &&
    filters.offset === DEFAULTS.offset &&
    filters.minTrades === DEFAULTS.minTrades &&
    filters.minWinRate === DEFAULTS.minWinRate &&
    filters.minProfitFactor === DEFAULTS.minProfitFactor &&
    filters.minPnl === DEFAULTS.minPnl &&
    filters.verifiedOnly === DEFAULTS.verifiedOnly &&
    filters.providerId === DEFAULTS.providerId
  );
}

module.exports = {
  DEFAULTS,
  normalizeWindow,
  normalizeSortBy,
  normalizeLimit,
  normalizeOffset,
  normalizeMinTrades,
  normalizePercentage,
  normalizeNumber,
  normalizeVerifiedOnly,
  normalizeProviderId,
  normalizeFilters,
  applyVerifiedFilter,
  applyMinTradesFilter,
  applyMinWinRateFilter,
  applyMinProfitFactorFilter,
  applyMinPnlFilter,
  applyProviderFilter,
  applyFilters,
  paginate,
  buildQueryParams,
  isDefaultFilterSet,
};