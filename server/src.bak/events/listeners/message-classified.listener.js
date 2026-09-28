/**
 * Message Classified Listener
 *
 * Enqueues parsing for messages classified as new trades or trade
 * management. Other classifications are archived by the classifier
 * service itself, so nothing is scheduled here.
 *
 * @module server/events/listeners/message-classified.listener
 */

import { subscribeToEvent } from '../event-subscriber';
import { EVENT_TYPES } from '../event-types';
import { logger } from '../../lib/logger';
import { db } from '../../database';

const EXECUTABLE_CLASSIFICATIONS = ['NEW_TRADE', 'TRADE_MANAGEMENT'];

async function handler(envelope) {
  const payload = envelope.payload || {};

  if (!EXECUTABLE_CLASSIFICATIONS.includes(payload.classification)) {
    return;
  }

  await db.query(
    `INSERT INTO jobs (job_type, payload, status, priority, scheduled_at, created_at, updated_at)
     VALUES ('PARSE_SIGNAL', $1, 'PENDING', 60, NOW(), NOW(), NOW())`,
    [
      JSON.stringify({
        storedMessageId: payload.storedMessageId || null,
        classification: payload.classification,
        providerId: payload.providerId || null,
        userId: payload.userId || null,
        text: payload.text || null,
      }),
    ],
  );

  logger.debug(
    { eventId: envelope.eventId, classification: payload.classification },
    'Parsing job enqueued',
  );
}

export function registerMessageClassifiedListener() {
  subscribeToEvent(EVENT_TYPES.MESSAGE_CLASSIFIED, handler);
}