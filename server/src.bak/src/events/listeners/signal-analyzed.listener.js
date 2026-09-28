/**
 * Signal Analyzed Listener
 *
 * @module server/events/listeners/signal-analyzed.listener
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

  if (payload.providerId) {
    await db.query(
      `INSERT INTO jobs (job_type, payload, status, priority, scheduled_at, created_at, updated_at)
       VALUES ('UPDATE_PROVIDER_DNA', $1, 'PENDING', 40, NOW(), NOW(), NOW())`,
      [JSON.stringify({ signalId: payload.signalId, providerId: payload.providerId })],
    );
  }

  logger.debug({ signalId: payload.signalId }, 'Provider DNA update scheduled');
}
function registerSignalAnalyzedListener() {
  subscribeToEvent(EVENT_TYPES.SIGNAL_ANALYZED, handler);
}
module.exports.registerSignalAnalyzedListener = registerSignalAnalyzedListener;
