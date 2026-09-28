/**
 * Notification Constants
 *
 * Shared constants used throughout the notification module.
 *
 * @module server/modules/notifications/notification.constants
 */
const NOTIFICATION_STATUSES = Object.freeze({
  QUEUED: 'QUEUED',
  SENDING: 'SENDING',
  SENT: 'SENT',
  DELIVERED: 'DELIVERED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
});
const NOTIFICATION_STATUS_VALUES = Object.freeze(Object.values(NOTIFICATION_STATUSES));
const CHANNEL_STATUSES = Object.freeze({
  PENDING: 'PENDING',
  SENT: 'SENT',
  DELIVERED: 'DELIVERED',
  FAILED: 'FAILED',
  RETRYING: 'RETRYING',
  SKIPPED: 'SKIPPED',
});
const CHANNEL_STATUS_VALUES = Object.freeze(Object.values(CHANNEL_STATUSES));
const DELIVERY_PRIORITIES = Object.freeze({
  LOW: 10,
  NORMAL: 50,
  HIGH: 80,
  CRITICAL: 100,
});
const MAX_RETRY_ATTEMPTS = 3;
const CHANNEL_RETRY_DELAYS_MS = Object.freeze([5000, 30000, 120000]);
const NOTIFICATION_EXPIRY_HOURS = 24 * 7;
const TEMPLATE_CACHE_TTL_MS = 5 * 60 * 1000;
const SUPPORTED_LOCALES = Object.freeze(['en', 'pt']);
const DEFAULT_LOCALE = 'en';
function isValidNotificationStatus(status) {
  return NOTIFICATION_STATUS_VALUES.includes(status);
}
function isValidChannelStatus(status) {
  return CHANNEL_STATUS_VALUES.includes(status);
}
function getPriorityWeight(priority) {
  return DELIVERY_PRIORITIES[priority] || DELIVERY_PRIORITIES.NORMAL;
}
module.exports.NOTIFICATION_STATUSES = NOTIFICATION_STATUSES;
module.exports.NOTIFICATION_STATUS_VALUES = NOTIFICATION_STATUS_VALUES;
module.exports.CHANNEL_STATUSES = CHANNEL_STATUSES;
module.exports.CHANNEL_STATUS_VALUES = CHANNEL_STATUS_VALUES;
module.exports.DELIVERY_PRIORITIES = DELIVERY_PRIORITIES;
module.exports.MAX_RETRY_ATTEMPTS = MAX_RETRY_ATTEMPTS;
module.exports.CHANNEL_RETRY_DELAYS_MS = CHANNEL_RETRY_DELAYS_MS;
module.exports.NOTIFICATION_EXPIRY_HOURS = NOTIFICATION_EXPIRY_HOURS;
module.exports.TEMPLATE_CACHE_TTL_MS = TEMPLATE_CACHE_TTL_MS;
module.exports.SUPPORTED_LOCALES = SUPPORTED_LOCALES;
module.exports.DEFAULT_LOCALE = DEFAULT_LOCALE;
module.exports.isValidNotificationStatus = isValidNotificationStatus;
module.exports.isValidChannelStatus = isValidChannelStatus;
module.exports.getPriorityWeight = getPriorityWeight;
