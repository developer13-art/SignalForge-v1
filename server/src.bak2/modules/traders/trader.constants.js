/**
 * Traders Module Constants
 *
 * @module signalforge/server/modules/traders/constants
 */
const TRADER_EVENTS = Object.freeze({
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
const TRADER_STATUSES = Object.freeze({
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  REJECTED: 'REJECTED',
  INACTIVE: 'INACTIVE',
});
const TRADER_STATUS_VALUES = Object.freeze(Object.values(TRADER_STATUSES));
const TRADER_VISIBILITY = Object.freeze({
  PUBLIC: 'PUBLIC',
  UNLISTED: 'UNLISTED',
  PRIVATE: 'PRIVATE',
});
const TRADER_VISIBILITY_VALUES = Object.freeze(
  Object.values(TRADER_VISIBILITY),
);
const COPY_MODES = Object.freeze({
  PROPORTIONAL: 'PROPORTIONAL',
  FIXED_LOT: 'FIXED_LOT',
  PERCENTAGE: 'PERCENTAGE',
  BALANCE_BASED: 'BALANCE_BASED',
  EQUITY_BASED: 'EQUITY_BASED',
});
const COPY_MODE_VALUES = Object.freeze(Object.values(COPY_MODES));
const FOLLOWER_STATUSES = Object.freeze({
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  STOPPED: 'STOPPED',
  PENDING: 'PENDING',
  REJECTED: 'REJECTED',
});
const FOLLOWER_STATUS_VALUES = Object.freeze(
  Object.values(FOLLOWER_STATUSES),
);
const LEADERBOARD_PERIODS = Object.freeze({
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
  MONTHLY: 'MONTHLY',
  QUARTERLY: 'QUARTERLY',
  YEARLY: 'YEARLY',
  ALL_TIME: 'ALL_TIME',
});
const LEADERBOARD_PERIOD_VALUES = Object.freeze(
  Object.values(LEADERBOARD_PERIODS),
);
const LEADERBOARD_METRICS = Object.freeze({
  PROFIT: 'PROFIT',
  WIN_RATE: 'WIN_RATE',
  PROFIT_FACTOR: 'PROFIT_FACTOR',
  SHARPE_RATIO: 'SHARPE_RATIO',
  AVERAGE_RR: 'AVERAGE_RR',
  CONSISTENCY: 'CONSISTENCY',
});
const LEADERBOARD_METRIC_VALUES = Object.freeze(
  Object.values(LEADERBOARD_METRICS),
);
const DEFAULT_MIN_COPY_LOT = 0.01;
const DEFAULT_MAX_COPY_LOT = 100;
const DEFAULT_LOT_MULTIPLIER = 1.0;
const DEFAULT_MAX_DAILY_TRADES = 50;
const DEFAULT_LEADERBOARD_LIMIT = 100;
const MAX_LEADERBOARD_LIMIT = 500;
function isValidTraderStatus(status) {
  return TRADER_STATUS_VALUES.includes(status);
}
function isValidTraderVisibility(visibility) {
  return TRADER_VISIBILITY_VALUES.includes(visibility);
}
function isValidCopyMode(mode) {
  return COPY_MODE_VALUES.includes(mode);
}
function isValidFollowerStatus(status) {
  return FOLLOWER_STATUS_VALUES.includes(status);
}
function isValidLeaderboardPeriod(period) {
  return LEADERBOARD_PERIOD_VALUES.includes(period);
}
function isValidLeaderboardMetric(metric) {
  return LEADERBOARD_METRIC_VALUES.includes(metric);
}
function isActive(status) {
  return [
    TRADER_STATUSES.APPROVED,
    TRADER_STATUSES.ACTIVE,
  ].includes(status);
}
module.exports.TRADER_EVENTS = TRADER_EVENTS;
module.exports.TRADER_STATUSES = TRADER_STATUSES;
module.exports.TRADER_STATUS_VALUES = TRADER_STATUS_VALUES;
module.exports.TRADER_VISIBILITY = TRADER_VISIBILITY;
module.exports.TRADER_VISIBILITY_VALUES = TRADER_VISIBILITY_VALUES;
module.exports.COPY_MODES = COPY_MODES;
module.exports.COPY_MODE_VALUES = COPY_MODE_VALUES;
module.exports.FOLLOWER_STATUSES = FOLLOWER_STATUSES;
module.exports.FOLLOWER_STATUS_VALUES = FOLLOWER_STATUS_VALUES;
module.exports.LEADERBOARD_PERIODS = LEADERBOARD_PERIODS;
module.exports.LEADERBOARD_PERIOD_VALUES = LEADERBOARD_PERIOD_VALUES;
module.exports.LEADERBOARD_METRICS = LEADERBOARD_METRICS;
module.exports.LEADERBOARD_METRIC_VALUES = LEADERBOARD_METRIC_VALUES;
module.exports.DEFAULT_MIN_COPY_LOT = DEFAULT_MIN_COPY_LOT;
module.exports.DEFAULT_MAX_COPY_LOT = DEFAULT_MAX_COPY_LOT;
module.exports.DEFAULT_LOT_MULTIPLIER = DEFAULT_LOT_MULTIPLIER;
module.exports.DEFAULT_MAX_DAILY_TRADES = DEFAULT_MAX_DAILY_TRADES;
module.exports.DEFAULT_LEADERBOARD_LIMIT = DEFAULT_LEADERBOARD_LIMIT;
module.exports.MAX_LEADERBOARD_LIMIT = MAX_LEADERBOARD_LIMIT;
module.exports.isValidTraderStatus = isValidTraderStatus;
module.exports.isValidTraderVisibility = isValidTraderVisibility;
module.exports.isValidCopyMode = isValidCopyMode;
module.exports.isValidFollowerStatus = isValidFollowerStatus;
module.exports.isValidLeaderboardPeriod = isValidLeaderboardPeriod;
module.exports.isValidLeaderboardMetric = isValidLeaderboardMetric;
module.exports.isActive = isActive;
