/**
 * Signal Detected Listener
 *
 * Fan-out trigger. After a signal has been parsed and validated, this
 * listener requests fan-out so subscribers receive their personalized
 * orders. The listener enqueues work rather than executing it, so
 * bursts are absorbed by the queue.
 *
 * @module server/events/listeners/signal-detected.listener
 */

import { subscribeToEvent } from '../event-subscriber';
import { EVENT_TYPES } from '../event-types';
import { logger } from '../../lib/logger';
import { db } from '../../database';

async function handler(envelope) {
  const payload = envelope.payload || {};

  if (!payload.signalId) {
    return;
  }

  await db.query(
    `INSERT INTO jobs (job_type, payload, status, priority, scheduled_at, created_at, updated_at)
     VALUES ('VALIDATE_SIGNAL', $1, 'PENDING', 70, NOW(), NOW(), NOW())`,
    [JSON.stringify({ signalId: payload.signalId, providerId: payload.providerId || null })],
  );

  logger.debug({ signalId: payload.signalId }, 'Validation job enqueued for detected signal');
}

export function registerSignalDetectedListener() {
  subscribeToEvent(EVENT_TYPES.SIGNAL_DETECTED, handler);
}