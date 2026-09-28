/**
 * Broker Module Constants
 *
 * @module signalforge/server/modules/brokers/constants
 */

export const BROKER_EVENTS = Object.freeze({
  BROKER_REGISTERED: 'broker.registered',
  BROKER_UPDATED: 'broker.updated',
  BROKER_DELETED: 'broker.deleted',
  ACCOUNT_CREATED: 'broker.account.created',
  ACCOUNT_CONNECTING: 'broker.account.connecting',
  ACCOUNT_CONNECTED: 'broker.account.connected',
  ACCOUNT_DISCONNECTED: 'broker.account.disconnected',
  ACCOUNT_DEPLOYING: 'broker.account.deploying',
  ACCOUNT_DEPLOYED: 'broker.account.deployed',
  ACCOUNT_DEPLOYMENT_FAILED: 'broker.account.deployment.failed',
  ACCOUNT_ERROR: 'broker.account.error',
  ACCOUNT_SYNCED: 'broker.account.synced',
  ACCOUNT_SNAPSHOT: 'broker.account.snapshot',
  ACCOUNT_HEALTH_CHECK: 'broker.account.health_check',
  ACCOUNT_CREDENTIALS_UPDATED: 'broker.account.credentials.updated',
  STREAM_CONNECTED: 'broker.stream.connected',
  STREAM_DISCONNECTED: 'broker.stream.disconnected',
  STREAM_EVENT: 'broker.stream.event',
  STREAM_ERROR: 'broker.stream.error',
  STREAM_RECONNECTING: 'broker.stream.reconnecting',
  RATE_LIMIT_HIT: 'broker.rate_limit.hit',
});

export const BROKER_PLATFORMS = Object.freeze({
  MT4: 'MT4',
  MT5: 'MT5',
  CTRADER: 'CTRADER',
  DXTRADE: 'DXTRADE',
  INTERACTIVE_BROKERS: 'INTERACTIVE_BROKERS',
  OANDA: 'OANDA',
});

export const BROKER_PLATFORM_VALUES = Object.freeze(Object.values(BROKER_PLATFORMS));

export const ACCOUNT_TYPES = Object.freeze({
  DEMO: 'DEMO',
  LIVE: 'LIVE',
  CONTEST: 'CONTEST',
});

export const ACCOUNT_TYPE_VALUES = Object.freeze(Object.values(ACCOUNT_TYPES));

export const ACCOUNT_STATUSES = Object.freeze({
  PENDING: 'PENDING',
  CONNECTING: 'CONNECTING',
  CONNECTED: 'CONNECTED',
  SYNCHRONIZING: 'SYNCHRONIZING',
  DEPLOYING: 'DEPLOYING',
  DEPLOYED: 'DEPLOYED',
  DISCONNECTED: 'DISCONNECTED',
  ERROR: 'ERROR',
  SUSPENDED: 'SUSPENDED',
  EXPIRED: 'EXPIRED',
});

export const ACCOUNT_STATUS_VALUES = Object.freeze(Object.values(ACCOUNT_STATUSES));

export const SYNC_STATUSES = Object.freeze({
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
});

export const DEFAULT_SYNC_INTERVAL_MS = 30000;
export const DEFAULT_SNAPSHOT_INTERVAL_MS = 60000;
export const DEFAULT_HEALTH_CHECK_INTERVAL_MS = 60000;
export const DEFAULT_DEPLOY_TIMEOUT_MS = 180000;
export const DEFAULT_RECONNECT_BASE_DELAY_MS = 5000;
export const DEFAULT_MAX_RECONNECT_ATTEMPTS = 10;
export const DEFAULT_RATE_LIMIT_WINDOW_MS = 60000;
export const DEFAULT_RATE_LIMIT_MAX = 1000;

export const METAAPI_SUPPORTED_PLATFORMS = Object.freeze([
  BROKER_PLATFORMS.MT4,
  BROKER_PLATFORMS.MT5,
]);

export const PLANNED_PLATFORMS = Object.freeze([
  BROKER_PLATFORMS.CTRADER,
  BROKER_PLATFORMS.DXTRADE,
  BROKER_PLATFORMS.INTERACTIVE_BROKERS,
  BROKER_PLATFORMS.OANDA,
]);

export function isValidPlatform(platform) {
  return BROKER_PLATFORM_VALUES.includes(platform);
}

export function isValidAccountType(type) {
  return ACCOUNT_TYPE_VALUES.includes(type);
}

export function isValidAccountStatus(status) {
  return ACCOUNT_STATUS_VALUES.includes(status);
}

export function isMetaApiSupported(platform) {
  return METAAPI_SUPPORTED_PLATFORMS.includes(platform);
}