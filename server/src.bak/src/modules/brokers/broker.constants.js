/**
 * Broker Module Constants
 *
 * @module signalforge/server/modules/brokers/constants
 */
const BROKER_EVENTS = Object.freeze({
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
const BROKER_PLATFORMS = Object.freeze({
  MT4: 'MT4',
  MT5: 'MT5',
  CTRADER: 'CTRADER',
  DXTRADE: 'DXTRADE',
  INTERACTIVE_BROKERS: 'INTERACTIVE_BROKERS',
  OANDA: 'OANDA',
});
const BROKER_PLATFORM_VALUES = Object.freeze(Object.values(BROKER_PLATFORMS));
const ACCOUNT_TYPES = Object.freeze({
  DEMO: 'DEMO',
  LIVE: 'LIVE',
  CONTEST: 'CONTEST',
});
const ACCOUNT_TYPE_VALUES = Object.freeze(Object.values(ACCOUNT_TYPES));
const ACCOUNT_STATUSES = Object.freeze({
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
const ACCOUNT_STATUS_VALUES = Object.freeze(Object.values(ACCOUNT_STATUSES));
const SYNC_STATUSES = Object.freeze({
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
});
const DEFAULT_SYNC_INTERVAL_MS = 30000;
const DEFAULT_SNAPSHOT_INTERVAL_MS = 60000;
const DEFAULT_HEALTH_CHECK_INTERVAL_MS = 60000;
const DEFAULT_DEPLOY_TIMEOUT_MS = 180000;
const DEFAULT_RECONNECT_BASE_DELAY_MS = 5000;
const DEFAULT_MAX_RECONNECT_ATTEMPTS = 10;
const DEFAULT_RATE_LIMIT_WINDOW_MS = 60000;
const DEFAULT_RATE_LIMIT_MAX = 1000;
const METAAPI_SUPPORTED_PLATFORMS = Object.freeze([
  BROKER_PLATFORMS.MT4,
  BROKER_PLATFORMS.MT5,
]);
const PLANNED_PLATFORMS = Object.freeze([
  BROKER_PLATFORMS.CTRADER,
  BROKER_PLATFORMS.DXTRADE,
  BROKER_PLATFORMS.INTERACTIVE_BROKERS,
  BROKER_PLATFORMS.OANDA,
]);
function isValidPlatform(platform) {
  return BROKER_PLATFORM_VALUES.includes(platform);
}
function isValidAccountType(type) {
  return ACCOUNT_TYPE_VALUES.includes(type);
}
function isValidAccountStatus(status) {
  return ACCOUNT_STATUS_VALUES.includes(status);
}
function isMetaApiSupported(platform) {
  return METAAPI_SUPPORTED_PLATFORMS.includes(platform);
}
module.exports.BROKER_EVENTS = BROKER_EVENTS;
module.exports.BROKER_PLATFORMS = BROKER_PLATFORMS;
module.exports.BROKER_PLATFORM_VALUES = BROKER_PLATFORM_VALUES;
module.exports.ACCOUNT_TYPES = ACCOUNT_TYPES;
module.exports.ACCOUNT_TYPE_VALUES = ACCOUNT_TYPE_VALUES;
module.exports.ACCOUNT_STATUSES = ACCOUNT_STATUSES;
module.exports.ACCOUNT_STATUS_VALUES = ACCOUNT_STATUS_VALUES;
module.exports.SYNC_STATUSES = SYNC_STATUSES;
module.exports.DEFAULT_SYNC_INTERVAL_MS = DEFAULT_SYNC_INTERVAL_MS;
module.exports.DEFAULT_SNAPSHOT_INTERVAL_MS = DEFAULT_SNAPSHOT_INTERVAL_MS;
module.exports.DEFAULT_HEALTH_CHECK_INTERVAL_MS = DEFAULT_HEALTH_CHECK_INTERVAL_MS;
module.exports.DEFAULT_DEPLOY_TIMEOUT_MS = DEFAULT_DEPLOY_TIMEOUT_MS;
module.exports.DEFAULT_RECONNECT_BASE_DELAY_MS = DEFAULT_RECONNECT_BASE_DELAY_MS;
module.exports.DEFAULT_MAX_RECONNECT_ATTEMPTS = DEFAULT_MAX_RECONNECT_ATTEMPTS;
module.exports.DEFAULT_RATE_LIMIT_WINDOW_MS = DEFAULT_RATE_LIMIT_WINDOW_MS;
module.exports.DEFAULT_RATE_LIMIT_MAX = DEFAULT_RATE_LIMIT_MAX;
module.exports.METAAPI_SUPPORTED_PLATFORMS = METAAPI_SUPPORTED_PLATFORMS;
module.exports.PLANNED_PLATFORMS = PLANNED_PLATFORMS;
module.exports.isValidPlatform = isValidPlatform;
module.exports.isValidAccountType = isValidAccountType;
module.exports.isValidAccountStatus = isValidAccountStatus;
module.exports.isMetaApiSupported = isMetaApiSupported;
