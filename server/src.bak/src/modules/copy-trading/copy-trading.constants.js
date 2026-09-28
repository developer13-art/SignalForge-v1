/**
 * Copy Trading Module Constants
 *
 * @module signalforge/server/modules/copy-trading/constants
 */
const COPY_TRADING_EVENTS = Object.freeze({
  SUBSCRIBED: 'copy_trading.subscribed',
  UNSUBSCRIBED: 'copy_trading.unsubscribed',
  SUBSCRIPTION_UPDATED: 'copy_trading.subscription.updated',
  SUBSCRIPTION_PAUSED: 'copy_trading.subscription.paused',
  SUBSCRIPTION_RESUMED: 'copy_trading.subscription.resumed',
  FANOUT_STARTED: 'copy_trading.fanout.started',
  FANOUT_BATCH_CREATED: 'copy_trading.fanout.batch.created',
  FANOUT_BATCH_COMPLETED: 'copy_trading.fanout.batch.completed',
  FANOUT_COMPLETED: 'copy_trading.fanout.completed',
  FANOUT_FAILED: 'copy_trading.fanout.failed',
  PERSONALIZED_TRADE_CREATED: 'copy_trading.personalized.trade.created',
  PERSONALIZATION_FAILED: 'copy_trading.personalization.failed',
  PROVIDER_STOP_SYNC: 'copy_trading.provider.stop.sync',
  SUBSCRIBER_RECONCILED: 'copy_trading.subscriber.reconciled',
  LATENCY_ALERT: 'copy_trading.latency.alert',
  COPY_FAILED: 'copy_trading.copy.failed',
});
const COPY_TRADING_STATUSES = Object.freeze({
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  STOPPED: 'STOPPED',
  PENDING: 'PENDING',
  REJECTED: 'REJECTED',
  EXPIRED: 'EXPIRED',
});
const COPY_TRADING_STATUS_VALUES = Object.freeze(
  Object.values(COPY_TRADING_STATUSES),
);
const SCALING_MODES = Object.freeze({
  FIXED_LOT: 'FIXED_LOT',
  PERCENTAGE: 'PERCENTAGE',
  BALANCE_BASED: 'BALANCE_BASED',
  EQUITY_BASED: 'EQUITY_BASED',
  PROVIDER_RATIO: 'PROVIDER_RATIO',
});
const SCALING_MODE_VALUES = Object.freeze(Object.values(SCALING_MODES));
const FANOUT_BATCH_STATUSES = Object.freeze({
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  PARTIAL: 'PARTIAL',
  FAILED: 'FAILED',
});
const DEFAULT_BATCH_SIZE = 50;
const DEFAULT_MAX_CONCURRENT_BATCHES = 5;
const DEFAULT_LATENCY_ALERT_MS = 2000;
const DEFAULT_MIN_LOT_SIZE = 0.01;
const DEFAULT_MAX_LOT_SIZE = 100;
const DEFAULT_LOT_STEP = 0.01;
const MAX_SUBSCRIBERS_PER_PROVIDER = 100000;
const SUBSCRIBER_RECONCILE_INTERVAL_MS = 60000;
function isValidCopyTradingStatus(status) {
  return COPY_TRADING_STATUS_VALUES.includes(status);
}
function isValidScalingMode(mode) {
  return SCALING_MODE_VALUES.includes(mode);
}
module.exports.COPY_TRADING_EVENTS = COPY_TRADING_EVENTS;
module.exports.COPY_TRADING_STATUSES = COPY_TRADING_STATUSES;
module.exports.COPY_TRADING_STATUS_VALUES = COPY_TRADING_STATUS_VALUES;
module.exports.SCALING_MODES = SCALING_MODES;
module.exports.SCALING_MODE_VALUES = SCALING_MODE_VALUES;
module.exports.FANOUT_BATCH_STATUSES = FANOUT_BATCH_STATUSES;
module.exports.DEFAULT_BATCH_SIZE = DEFAULT_BATCH_SIZE;
module.exports.DEFAULT_MAX_CONCURRENT_BATCHES = DEFAULT_MAX_CONCURRENT_BATCHES;
module.exports.DEFAULT_LATENCY_ALERT_MS = DEFAULT_LATENCY_ALERT_MS;
module.exports.DEFAULT_MIN_LOT_SIZE = DEFAULT_MIN_LOT_SIZE;
module.exports.DEFAULT_MAX_LOT_SIZE = DEFAULT_MAX_LOT_SIZE;
module.exports.DEFAULT_LOT_STEP = DEFAULT_LOT_STEP;
module.exports.MAX_SUBSCRIBERS_PER_PROVIDER = MAX_SUBSCRIBERS_PER_PROVIDER;
module.exports.SUBSCRIBER_RECONCILE_INTERVAL_MS = SUBSCRIBER_RECONCILE_INTERVAL_MS;
module.exports.isValidCopyTradingStatus = isValidCopyTradingStatus;
module.exports.isValidScalingMode = isValidScalingMode;
