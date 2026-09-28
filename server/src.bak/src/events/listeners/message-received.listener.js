/**
 * Message Received Listener
 *
 * Schedules classification and parsing for every received message
 * by enqueuing a CLASSIFY_MESSAGE job. The listener is deliberately
 * thin so that the queue picks up the work asynchronously.
 *
 * @module server/events/listeners/message-received.listener
 */
const { subscribeToEvent } = require('../event-subscriber');
const { EVENT_TYPES } = require('../event-types');
const { logger } = require('../../lib/logger');
const { db } = require('../../database');

async function handler(envelope) {
  const payload = envelope.payload || {};

  if (!payload.sourceType || !payload.externalMessageId) {
    logger.debug({ eventId: envelope.eventId }, 'Skipping message without classification-relevant fields');
    return;
  }

  await db.query(
    `INSERT INTO jobs (job_type, payload, status, priority, scheduled_at, created_at, updated_at)
     VALUES ('CLASSIFY_MESSAGE', $1, 'PENDING', 50, NOW(), NOW(), NOW())`,
    [
      JSON.stringify({
        storedMessageId: payload.storedMessageId || null,
        sourceType: payload.sourceType,
        sourceId: payload.sourceId,
        externalMessageId: payload.externalMessageId,
        userId: payload.userId || null,
      }),
    ],
  );

  logger.debug({ eventId: envelope.eventId }, 'Classification job enqueued for received message');
}
function registerMessageReceivedListener() {
  subscribeToEvent(EVENT_TYPES.MESSAGE_RECEIVED, handler);
}
module.exports.registerMessageReceivedListener = registerMessageReceivedListener;
