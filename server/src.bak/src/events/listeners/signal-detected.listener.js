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
     VALUES ('VALIDATE_SIGNAL', $1, 'PENDING', 70, NOW(), NOW(), NOW())`,
    [JSON.stringify({ signalId: payload.signalId, providerId: payload.providerId || null })],
  );

  logger.debug({ signalId: payload.signalId }, 'Validation job enqueued for detected signal');
}
function registerSignalDetectedListener() {
  subscribeToEvent(EVENT_TYPES.SIGNAL_DETECTED, handler);
}
module.exports.registerSignalDetectedListener = registerSignalDetectedListener;
