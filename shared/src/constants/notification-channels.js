/**
 * Notification Channels
 *
 * Defines the delivery channels supported by the Notification Service.
 *
 * @module @signalforge/shared/constants/notification-channels
 */

export const NOTIFICATION_CHANNELS = Object.freeze({
  IN_APP: 'IN_APP',
  EMAIL: 'EMAIL',
  SMS: 'SMS',
  PUSH: 'PUSH',
  TELEGRAM: 'TELEGRAM',
  DISCORD: 'DISCORD',
  WEBHOOK: 'WEBHOOK',
});

export const NOTIFICATION_CHANNEL_VALUES = Object.freeze(
  Object.values(NOTIFICATION_CHANNELS),
);

export const NOTIFICATION_CHANNEL_LABELS = Object.freeze({
  [NOTIFICATION_CHANNELS.IN_APP]: 'In-App',
  [NOTIFICATION_CHANNELS.EMAIL]: 'Email',
  [NOTIFICATION_CHANNELS.SMS]: 'SMS',
  [NOTIFICATION_CHANNELS.PUSH]: 'Push Notification',
  [NOTIFICATION_CHANNELS.TELEGRAM]: 'Telegram',
  [NOTIFICATION_CHANNELS.DISCORD]: 'Discord',
  [NOTIFICATION_CHANNELS.WEBHOOK]: 'Webhook',
});

export const DEFAULT_ENABLED_CHANNELS = Object.freeze([
  NOTIFICATION_CHANNELS.IN_APP,
  NOTIFICATION_CHANNELS.EMAIL,
]);

export const CRITICAL_CHANNELS = Object.freeze([
  NOTIFICATION_CHANNELS.IN_APP,
  NOTIFICATION_CHANNELS.EMAIL,
  NOTIFICATION_CHANNELS.PUSH,
]);

export function isValidNotificationChannel(channel) {
  return NOTIFICATION_CHANNEL_VALUES.includes(channel);
}