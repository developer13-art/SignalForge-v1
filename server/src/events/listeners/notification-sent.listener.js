/**
 * Notification Sent Listener
 *
 * Optional telemetry listener. Currently logs high-priority
 * notification deliveries for monitoring.
 *
 * @module server/events/listeners/notification-sent.listener
 */

import { subscribeToEvent } from '../event-subscriber';
import { EVENT_TYPES } from '../event-types';
import { logger } from '../../lib/logger';

async function handler(envelope) {
  const payload = envelope.payload || {};

  logger.debug(
    { notificationId: payload.notificationId, channel: payload.channel },
    'Notification delivered',
  );
}

export function registerNotificationSentListener() {
  subscribeToEvent(EVENT_TYPES.NOTIFICATION_SENT, handler);
}