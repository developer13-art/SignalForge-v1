/**
 * Notification Events
 *
 * Event helpers for publishing notification events on the platform
 * Event Bus.
 *
 * @module server/modules/notifications/notification.events
 */

import { EVENT_TYPES } from '@signalforge/shared/constants/event-types';
import { publishEvent } from '../../events/event-publisher';

const SOURCE = 'notification.events';

export async function emitNotificationQueued({ notificationId, userId, type, channels }) {
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

export async function emitNotificationSent({ notificationId, userId, type, channel }) {
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

export async function emitNotificationFailed({ notificationId, userId, type, channel, reason }) {
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

export async function emitNotificationDelivered({ notificationId, userId, channel }) {
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

export const NOTIFICATION_EVENT_NAMES = Object.freeze({
  QUEUED: EVENT_TYPES.NOTIFICATION_QUEUED,
  SENT: EVENT_TYPES.NOTIFICATION_SENT,
  FAILED: EVENT_TYPES.NOTIFICATION_FAILED,
});