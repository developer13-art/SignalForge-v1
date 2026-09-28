/**
 * Parse Signal Job
 *
 * @module server/jobs/job-types/parse-signal.job
 */
const { registerJobHandler } = require('../job-registry');
const { logger } = require('../../lib/logger');
const { EVENT_TYPES } = require('@signalforge/shared/constants/event-types');
const { publishEvent } = require('../../events/event-publisher');
const { db } = require('../../database');

async function handler(payload) {
  if (!payload.storedMessageId) {
    return;
  }

  const { rows } = await db.query(
    `SELECT id, user_id, text, classification, provider_id
       FROM source_messages
      WHERE id = $1 LIMIT 1`,
    [payload.storedMessageId],
  );

  const message = rows[0];

  if (!message) {
    return;
  }

  let parsed = null;

  try {
    const { parserService } = await import(
      '../../modules/ai-signal-intelligence/parser/parser.service'
    );
    parsed = await parserService.parse({
      text: message.text,
      providerId: message.provider_id,
      userId: message.user_id,
    });
  } catch (err) {
    logger.warn({ err, storedMessageId: payload.storedMessageId }, 'AI parser unavailable');
  }

  await publishEvent({
    eventType: EVENT_TYPES.SIGNAL_DETECTED,
    source: 'parse-signal.job',
    actorId: message.user_id,
    payload: {
      signalId: parsed && parsed.signalId ? parsed.signalId : null,
      storedMessageId: message.id,
      providerId: message.provider_id,
      classification: message.classification,
      parsed,
    },
  });
}
function registerParseSignalJob() {
  registerJobHandler({
    jobType: 'PARSE_SIGNAL',
    handler,
  });
}
module.exports = handler;
module.exports.registerParseSignalJob = registerParseSignalJob;
