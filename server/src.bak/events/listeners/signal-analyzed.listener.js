/**
 * Signal Analyzed Listener
 *
 * @module server/events/listeners/signal-analyzed.listener
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

  if (payload.providerId) {
    await db.query(
      `INSERT INTO jobs (job_type, payload, status, priority, scheduled_at, created_at, updated_at)
       VALUES ('UPDATE_PROVIDER_DNA', $1, 'PENDING', 40, NOW(), NOW(), NOW())`,
      [JSON.stringify({ signalId: payload.signalId, providerId: payload.providerId })],
    );
  }

  logger.debug({ signalId: payload.signalId }, 'Provider DNA update scheduled');
}

export function registerSignalAnalyzedListener() {
  subscribeToEvent(EVENT_TYPES.SIGNAL_ANALYZED, handler);
}