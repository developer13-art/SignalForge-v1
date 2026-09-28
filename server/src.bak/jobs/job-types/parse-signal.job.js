/**
 * Parse Signal Job
 *
 * @module server/jobs/job-types/parse-signal.job
 */

import { registerJobHandler } from '../job-registry';
import { logger } from '../../lib/logger';
import { EVENT_TYPES } from '@signalforge/shared/constants/event-types';
import { publishEvent } from '../../events/event-publisher';
import { db } from '../../database';

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

export function registerParseSignalJob() {
  registerJobHandler({
    jobType: 'PARSE_SIGNAL',
    handler,
  });
}

export default handler;