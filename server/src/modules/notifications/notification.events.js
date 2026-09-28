/**
 * Notification Events
 *
 * Event helpers for publishing notification events on the platform
 * Event Bus.
 *
 * @module server/modules/notifications/notification.events
 */
const { EVENT_TYPES } = require('@signalforge/shared/constants/event-types');
const { publishEvent } = require('../../events/event-publisher');

const SOURCE = 'notification.events';
async function emitNotificationQueued({ notificationId, userId, type, channels }) {
  return publishEvent({
    eventType: EVENT_TYPES.NOTIFICATION_QUEUED,
    source: SOURCE,
    actorId: null,
    payload: {
      notificationId,
      userId,
      type,
      channels,
      queuedAt: new Date().toISOString(),
    },
  });
}
async function emitNotificationSent({ notificationId, userId, type, channel }) {
  return publishEvent({
    eventType: EVENT_TYPES.NOTIFICATION_SENT,
    source: SOURCE,
    actorId: null,
    payload: {
      notificationId,
      userId,
      type,
      channel,
      sentAt: new Date().toISOString(),
    },
  });
}
async function emitNotificationFailed({ notificationId, userId, type, channel, reason }) {
  return publishEvent({
    eventType: EVENT_TYPES.NOTIFICATION_FAILED,
    source: SOURCE,
    actorId: null,
    payload: {
      notificationId,
      userId,
      type,
      channel,
      reason: reason || null,
      failedAt: new Date().toISOString(),
    },
  });
}
async function emitNotificationDelivered({ notificationId, userId, channel }) {
  return publishEvent({
    eventType: EVENT_TYPES.NOTIFICATION_SENT,
    source: SOURCE,
    actorId: null,
    payload: {
      notificationId,
      userId,
      channel,
      status: 'DELIVERED',
      deliveredAt: new Date().toISOString(),
    },
  });
}
const NOTIFICATION_EVENT_NAMES = Object.freeze({
  QUEUED: EVENT_TYPES.NOTIFICATION_QUEUED,
  SENT: EVENT_TYPES.NOTIFICATION_SENT,
  FAILED: EVENT_TYPES.NOTIFICATION_FAILED,
});
module.exports.NOTIFICATION_EVENT_NAMES = NOTIFICATION_EVENT_NAMES;

module.exports.emitNotificationQueued = emitNotificationQueued;

module.exports.emitNotificationSent = emitNotificationSent;

module.exports.emitNotificationFailed = emitNotificationFailed;

module.exports.emitNotificationDelivered = emitNotificationDelivered;
