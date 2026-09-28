/**
 * Notification Constants
 *
 * Shared constants used throughout the notification module.
 *
 * @module server/modules/notifications/notification.constants
 */

export const NOTIFICATION_STATUSES = Object.freeze({
  QUEUED: 'QUEUED',
  SENDING: 'SENDING',
  SENT: 'SENT',
  DELIVERED: 'DELIVERED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
});

export const NOTIFICATION_STATUS_VALUES = Object.freeze(Object.values(NOTIFICATION_STATUSES));

export const CHANNEL_STATUSES = Object.freeze({
  PENDING: 'PENDING',
  SENT: 'SENT',
  DELIVERED: 'DELIVERED',
  FAILED: 'FAILED',
  RETRYING: 'RETRYING',
  SKIPPED: 'SKIPPED',
});

export const CHANNEL_STATUS_VALUES = Object.freeze(Object.values(CHANNEL_STATUSES));

export const DELIVERY_PRIORITIES = Object.freeze({
  LOW: 10,
  NORMAL: 50,
  HIGH: 80,
  CRITICAL: 100,
});

export const MAX_RETRY_ATTEMPTS = 3;

export const CHANNEL_RETRY_DELAYS_MS = Object.freeze([5000, 30000, 120000]);

export const NOTIFICATION_EXPIRY_HOURS = 24 * 7;

export const TEMPLATE_CACHE_TTL_MS = 5 * 60 * 1000;

export const SUPPORTED_LOCALES = Object.freeze(['en', 'pt']);

export const DEFAULT_LOCALE = 'en';

export function isValidNotificationStatus(status) {
  return NOTIFICATION_STATUS_VALUES.includes(status);
}

export function isValidChannelStatus(status) {
  return CHANNEL_STATUS_VALUES.includes(status);
}

export function getPriorityWeight(priority) {
  return DELIVERY_PRIORITIES[priority] || DELIVERY_PRIORITIES.NORMAL;
}