/**
 * Classify Message Job
 *
 * @module server/jobs/job-types/classify-message.job
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
    `SELECT id, user_id, source_type, source_id, text, envelope
       FROM source_messages
      WHERE id = $1 LIMIT 1`,
    [payload.storedMessageId],
  );

  const message = rows[0];

  if (!message) {
    logger.warn({ storedMessageId: payload.storedMessageId }, 'Message not found for classification');
    return;
  }

  let classification = 'UNKNOWN';
  let confidence = 0;

  try {
    const { hybridClassifier } = await import(
      '../../modules/signal-classification/classifiers/hybrid.classifier'
    );
    const result = await hybridClassifier.classify({ text: message.text || '' });
    classification = result.classification;
    confidence = result.confidence;
  } catch (err) {
    logger.warn({ err, storedMessageId: payload.storedMessageId }, 'Classifier unavailable, using UNKNOWN');
  }

  await db.query(
    `UPDATE source_messages
        SET processing_status = 'CLASSIFIED', updated_at = NOW()
      WHERE id = $1`,
    [message.id],
  );

  await publishEvent({
    eventType: EVENT_TYPES.MESSAGE_CLASSIFIED,
    source: 'classify-message.job',
    actorId: message.user_id,
    payload: {
      storedMessageId: message.id,
      sourceType: message.source_type,
      sourceId: message.source_id,
      classification,
      confidence,
      userId: message.user_id,
      text: message.text,
    },
  });
}
function registerClassifyMessageJob() {
  registerJobHandler({
    jobType: 'CLASSIFY_MESSAGE',
    handler,
  });
}
module.exports = handler;
module.exports.registerClassifyMessageJob = registerClassifyMessageJob;
