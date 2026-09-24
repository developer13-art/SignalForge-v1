/**
 * Message Received Listener
 *
 * Schedules classification and parsing for every received message
 * by enqueuing a CLASSIFY_MESSAGE job. The listener is deliberately
 * thin so that the queue picks up the work asynchronously.
 *
 * @module server/events/listeners/message-received.listener
 */

import { subscribeToEvent } from '../event-subscriber';
import { EVENT_TYPES } from '../event-types';
import { logger } from '../../lib/logger';
import { db } from '../../database';

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

export function registerMessageReceivedListener() {
  subscribeToEvent(EVENT_TYPES.MESSAGE_RECEIVED, handler);
}