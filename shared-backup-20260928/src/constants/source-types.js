/**
 * Source Types
 *
 * Defines the signal source types supported by SignalForge.
 *
 * @module @signalforge/shared/constants/source-types
 */const SOURCE_TYPES = Object.freeze({
  TELEGRAM: 'TELEGRAM',
  DISCORD: 'DISCORD',
  WHATSAPP: 'WHATSAPP',
  TRADINGVIEW: 'TRADINGVIEW',
  EMAIL: 'EMAIL',
  REST_API: 'REST_API',
});const SOURCE_TYPE_VALUES = Object.freeze(Object.values(SOURCE_TYPES));const SOURCE_TYPE_LABELS = Object.freeze({
  [SOURCE_TYPES.TELEGRAM]: 'Telegram',
  [SOURCE_TYPES.DISCORD]: 'Discord',
  [SOURCE_TYPES.WHATSAPP]: 'WhatsApp',
  [SOURCE_TYPES.TRADINGVIEW]: 'TradingView',
  [SOURCE_TYPES.EMAIL]: 'Email',
  [SOURCE_TYPES.REST_API]: 'REST API',
});const SOURCE_TYPE_DESCRIPTIONS = Object.freeze({
  [SOURCE_TYPES.TELEGRAM]: 'Telegram channels and groups monitored via a user session.',
  [SOURCE_TYPES.DISCORD]: 'Discord servers and channels monitored via bot or OAuth.',
  [SOURCE_TYPES.WHATSAPP]: 'WhatsApp groups monitored via Cloud API or Business API.',
  [SOURCE_TYPES.TRADINGVIEW]: 'TradingView alerts delivered via webhooks.',
  [SOURCE_TYPES.EMAIL]: 'Email inboxes monitored via IMAP.',
  [SOURCE_TYPES.REST_API]: 'Direct provider integration via REST API.',
});const SOURCE_CONNECTION_STATUSES = Object.freeze({
  PENDING: 'PENDING',
  CONNECTING: 'CONNECTING',
  CONNECTED: 'CONNECTED',
  DISCONNECTED: 'DISCONNECTED',
  ERROR: 'ERROR',
  SUSPENDED: 'SUSPENDED',
  EXPIRED: 'EXPIRED',
});const SOURCE_CONNECTION_STATUS_VALUES = Object.freeze(
  Object.values(SOURCE_CONNECTION_STATUSES),
);const SOURCE_CONNECTION_STATUS_LABELS = Object.freeze({
  [SOURCE_CONNECTION_STATUSES.PENDING]: 'Pending',
  [SOURCE_CONNECTION_STATUSES.CONNECTING]: 'Connecting',
  [SOURCE_CONNECTION_STATUSES.CONNECTED]: 'Connected',
  [SOURCE_CONNECTION_STATUSES.DISCONNECTED]: 'Disconnected',
  [SOURCE_CONNECTION_STATUSES.ERROR]: 'Error',
  [SOURCE_CONNECTION_STATUSES.SUSPENDED]: 'Suspended',
  [SOURCE_CONNECTION_STATUSES.EXPIRED]: 'Expired',
});function isValidSourceType(type) {
  return SOURCE_TYPE_VALUES.includes(type);
}function isValidSourceConnectionStatus(status) {
  return SOURCE_CONNECTION_STATUS_VALUES.includes(status);
}

module.exports.isValidSourceType = isValidSourceType;
module.exports.isValidSourceConnectionStatus = isValidSourceConnectionStatus;
module.exports.SOURCE_TYPES = SOURCE_TYPES;
module.exports.SOURCE_TYPE_VALUES = SOURCE_TYPE_VALUES;
module.exports.SOURCE_TYPE_LABELS = SOURCE_TYPE_LABELS;
module.exports.SOURCE_TYPE_DESCRIPTIONS = SOURCE_TYPE_DESCRIPTIONS;
module.exports.SOURCE_CONNECTION_STATUSES = SOURCE_CONNECTION_STATUSES;
module.exports.SOURCE_CONNECTION_STATUS_VALUES = SOURCE_CONNECTION_STATUS_VALUES;
module.exports.SOURCE_CONNECTION_STATUS_LABELS = SOURCE_CONNECTION_STATUS_LABELS;
