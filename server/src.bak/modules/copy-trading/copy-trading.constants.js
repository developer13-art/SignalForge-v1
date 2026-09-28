/**
 * Copy Trading Module Constants
 *
 * @module signalforge/server/modules/copy-trading/constants
 */

export const COPY_TRADING_EVENTS = Object.freeze({
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

export const COPY_TRADING_STATUSES = Object.freeze({
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  STOPPED: 'STOPPED',
  PENDING: 'PENDING',
  REJECTED: 'REJECTED',
  EXPIRED: 'EXPIRED',
});

export const COPY_TRADING_STATUS_VALUES = Object.freeze(
  Object.values(COPY_TRADING_STATUSES),
);

export const SCALING_MODES = Object.freeze({
  FIXED_LOT: 'FIXED_LOT',
  PERCENTAGE: 'PERCENTAGE',
  BALANCE_BASED: 'BALANCE_BASED',
  EQUITY_BASED: 'EQUITY_BASED',
  PROVIDER_RATIO: 'PROVIDER_RATIO',
});

export const SCALING_MODE_VALUES = Object.freeze(Object.values(SCALING_MODES));

export const FANOUT_BATCH_STATUSES = Object.freeze({
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  PARTIAL: 'PARTIAL',
  FAILED: 'FAILED',
});

export const DEFAULT_BATCH_SIZE = 50;
export const DEFAULT_MAX_CONCURRENT_BATCHES = 5;
export const DEFAULT_LATENCY_ALERT_MS = 2000;
export const DEFAULT_MIN_LOT_SIZE = 0.01;
export const DEFAULT_MAX_LOT_SIZE = 100;
export const DEFAULT_LOT_STEP = 0.01;
export const MAX_SUBSCRIBERS_PER_PROVIDER = 100000;
export const SUBSCRIBER_RECONCILE_INTERVAL_MS = 60000;

export function isValidCopyTradingStatus(status) {
  return COPY_TRADING_STATUS_VALUES.includes(status);
}

export function isValidScalingMode(mode) {
  return SCALING_MODE_VALUES.includes(mode);
}