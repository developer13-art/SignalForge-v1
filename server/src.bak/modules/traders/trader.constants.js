/**
 * Traders Module Constants
 *
 * @module signalforge/server/modules/traders/constants
 */

export const TRADER_EVENTS = Object.freeze({
  TRADER_REGISTERED: 'trader.registered',
  TRADER_UPDATED: 'trader.updated',
  TRADER_APPROVED: 'trader.approved',
  TRADER_SUSPENDED: 'trader.suspended',
  TRADER_REINSTATED: 'trader.reinstated',
  TRADER_PROFILE_UPDATED: 'trader.profile.updated',
  TRADER_AVATAR_UPDATED: 'trader.avatar.updated',
  TRADER_AVATAR_REMOVED: 'trader.avatar.removed',
  FOLLOWER_ADDED: 'trader.follower.added',
  FOLLOWER_REMOVED: 'trader.follower.removed',
  COPY_SETTINGS_UPDATED: 'trader.copy.settings.updated',
  LEADERBOARD_REFRESHED: 'trader.leaderboard.refreshed',
});

export const TRADER_STATUSES = Object.freeze({
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  REJECTED: 'REJECTED',
  INACTIVE: 'INACTIVE',
});

export const TRADER_STATUS_VALUES = Object.freeze(Object.values(TRADER_STATUSES));

export const TRADER_VISIBILITY = Object.freeze({
  PUBLIC: 'PUBLIC',
  UNLISTED: 'UNLISTED',
  PRIVATE: 'PRIVATE',
});

export const TRADER_VISIBILITY_VALUES = Object.freeze(
  Object.values(TRADER_VISIBILITY),
);

export const COPY_MODES = Object.freeze({
  PROPORTIONAL: 'PROPORTIONAL',
  FIXED_LOT: 'FIXED_LOT',
  PERCENTAGE: 'PERCENTAGE',
  BALANCE_BASED: 'BALANCE_BASED',
  EQUITY_BASED: 'EQUITY_BASED',
});

export const COPY_MODE_VALUES = Object.freeze(Object.values(COPY_MODES));

export const FOLLOWER_STATUSES = Object.freeze({
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  STOPPED: 'STOPPED',
  PENDING: 'PENDING',
  REJECTED: 'REJECTED',
});

export const FOLLOWER_STATUS_VALUES = Object.freeze(
  Object.values(FOLLOWER_STATUSES),
);

export const LEADERBOARD_PERIODS = Object.freeze({
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
  MONTHLY: 'MONTHLY',
  QUARTERLY: 'QUARTERLY',
  YEARLY: 'YEARLY',
  ALL_TIME: 'ALL_TIME',
});

export const LEADERBOARD_PERIOD_VALUES = Object.freeze(
  Object.values(LEADERBOARD_PERIODS),
);

export const LEADERBOARD_METRICS = Object.freeze({
  PROFIT: 'PROFIT',
  WIN_RATE: 'WIN_RATE',
  PROFIT_FACTOR: 'PROFIT_FACTOR',
  SHARPE_RATIO: 'SHARPE_RATIO',
  AVERAGE_RR: 'AVERAGE_RR',
  CONSISTENCY: 'CONSISTENCY',
});

export const LEADERBOARD_METRIC_VALUES = Object.freeze(
  Object.values(LEADERBOARD_METRICS),
);

export const DEFAULT_MIN_COPY_LOT = 0.01;
export const DEFAULT_MAX_COPY_LOT = 100;
export const DEFAULT_LOT_MULTIPLIER = 1.0;
export const DEFAULT_MAX_DAILY_TRADES = 50;
export const DEFAULT_LEADERBOARD_LIMIT = 100;
export const MAX_LEADERBOARD_LIMIT = 500;

export function isValidTraderStatus(status) {
  return TRADER_STATUS_VALUES.includes(status);
}

export function isValidTraderVisibility(visibility) {
  return TRADER_VISIBILITY_VALUES.includes(visibility);
}

export function isValidCopyMode(mode) {
  return COPY_MODE_VALUES.includes(mode);
}

export function isValidFollowerStatus(status) {
  return FOLLOWER_STATUS_VALUES.includes(status);
}

export function isValidLeaderboardPeriod(period) {
  return LEADERBOARD_PERIOD_VALUES.includes(period);
}

export function isValidLeaderboardMetric(metric) {
  return LEADERBOARD_METRIC_VALUES.includes(metric);
}

export function isActive(status) {
  return [
    TRADER_STATUSES.APPROVED,
    TRADER_STATUSES.ACTIVE,
  ].includes(status);
}