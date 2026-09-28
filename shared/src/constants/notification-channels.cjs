/**
 * Notification Channels
 *
 * Defines the delivery channels supported by the Notification Service.
 *
 * @module @signalforge/shared/constants/notification-channels
 */const NOTIFICATION_CHANNELS = Object.freeze({
  IN_APP: 'IN_APP',
  EMAIL: 'EMAIL',
  SMS: 'SMS',
  PUSH: 'PUSH',
  TELEGRAM: 'TELEGRAM',
  DISCORD: 'DISCORD',
  WEBHOOK: 'WEBHOOK',
});const NOTIFICATION_CHANNEL_VALUES = Object.freeze(
  Object.values(NOTIFICATION_CHANNELS),
);const NOTIFICATION_CHANNEL_LABELS = Object.freeze({
  [NOTIFICATION_CHANNELS.IN_APP]: 'In-App',
  [NOTIFICATION_CHANNELS.EMAIL]: 'Email',
  [NOTIFICATION_CHANNELS.SMS]: 'SMS',
  [NOTIFICATION_CHANNELS.PUSH]: 'Push Notification',
  [NOTIFICATION_CHANNELS.TELEGRAM]: 'Telegram',
  [NOTIFICATION_CHANNELS.DISCORD]: 'Discord',
  [NOTIFICATION_CHANNELS.WEBHOOK]: 'Webhook',
});const DEFAULT_ENABLED_CHANNELS = Object.freeze([
  NOTIFICATION_CHANNELS.IN_APP,
  NOTIFICATION_CHANNELS.EMAIL,
]);const CRITICAL_CHANNELS = Object.freeze([
  NOTIFICATION_CHANNELS.IN_APP,
  NOTIFICATION_CHANNELS.EMAIL,
  NOTIFICATION_CHANNELS.PUSH,
]);function isValidNotificationChannel(channel) {
  return NOTIFICATION_CHANNEL_VALUES.includes(channel);
}

module.exports.isValidNotificationChannel = isValidNotificationChannel;
module.exports.NOTIFICATION_CHANNELS = NOTIFICATION_CHANNELS;
module.exports.NOTIFICATION_CHANNEL_VALUES = NOTIFICATION_CHANNEL_VALUES;
module.exports.NOTIFICATION_CHANNEL_LABELS = NOTIFICATION_CHANNEL_LABELS;
module.exports.DEFAULT_ENABLED_CHANNELS = DEFAULT_ENABLED_CHANNELS;
module.exports.CRITICAL_CHANNELS = CRITICAL_CHANNELS;
