/**
 * Notification Sent Listener
 *
 * Optional telemetry listener. Currently logs high-priority
 * notification deliveries for monitoring.
 *
 * @module server/events/listeners/notification-sent.listener
 */
const { subscribeToEvent } = require('../event-subscriber');
const { EVENT_TYPES } = require('../event-types');
const { logger } = require('../../lib/logger');

async function handler(envelope) {
  const payload = envelope.payload || {};

  logger.debug(
    { notificationId: payload.notificationId, channel: payload.channel },
    'Notification delivered',
  );
}
function registerNotificationSentListener() {
  subscribeToEvent(EVENT_TYPES.NOTIFICATION_SENT, handler);
}
module.exports.registerNotificationSentListener = registerNotificationSentListener;
