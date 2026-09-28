/**
 * Signal Validated Listener
 *
 * Fan-out trigger. Enqueues SIGNAL_FANOUT_REQUESTED processing so
 * that thousands of subscribers can be served by parallel workers.
 *
 * @module server/events/listeners/signal-validated.listener
 */
const { subscribeToEvent } = require('../event-subscriber');
const { EVENT_TYPES } = require('../event-types');
const { logger } = require('../../lib/logger');
const { db } = require('../../database');

async function handler(envelope) {
  const payload = envelope.payload || {};

  if (!payload.signalId) {
    return;
  }

  await db.query(
    `INSERT INTO jobs (job_type, payload, status, priority, scheduled_at, created_at, updated_at)
     VALUES ('FAN_OUT_SIGNAL', $1, 'PENDING', 80, NOW(), NOW(), NOW())`,
    [JSON.stringify({ signalId: payload.signalId })],
  );

  logger.debug({ signalId: payload.signalId }, 'Fan-out job enqueued for validated signal');
}
function registerSignalValidatedListener() {
  subscribeToEvent(EVENT_TYPES.SIGNAL_VALIDATED, handler);
}
module.exports.registerSignalValidatedListener = registerSignalValidatedListener;
