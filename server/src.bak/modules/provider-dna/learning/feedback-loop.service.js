/**
 * Feedback Loop Service
 *
 * Closes the learning loop for Provider DNA: records parsing outcomes
 * after execution, aggregates success and failure signals, and triggers
 * DNA rule updates when patterns show consistent behavior.
 *
 * @module server/modules/provider-dna/learning/feedback-loop.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { logger } from '../../../lib/logger';
import { nowIso } from '@signalforge/shared/utils/date.util';
import { db } from '../../../database';
import { publishEvent } from '../../../events/event-publisher';
import { EVENT_TYPES } from '@signalforge/shared/constants/event-types';

const FEEDBACK_TYPES = Object.freeze({
  PARSE_SUCCESS: 'PARSE_SUCCESS',
  PARSE_FAILURE: 'PARSE_FAILURE',
  EXECUTION_SUCCESS: 'EXECUTION_SUCCESS',
  EXECUTION_FAILURE: 'EXECUTION_FAILURE',
  USER_CORRECTION: 'USER_CORRECTION',
  MANAGEMENT_MATCH: 'MANAGEMENT_MATCH',
  MANAGEMENT_MISMATCH: 'MANAGEMENT_MISMATCH',
});

const LEARNING_THRESHOLD = 5;

export async function recordFeedback({
  providerId,
  signalId,
  messageId,
  feedbackType,
  details,
  actorId,
}) {
  if (!providerId || !feedbackType) {
    throw new AppError('providerId and feedbackType are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (!Object.values(FEEDBACK_TYPES).includes(feedbackType)) {
    throw new AppError(`Invalid feedbackType: ${feedbackType}`, ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const { rows } = await db.query(
    `INSERT INTO provider_dna_feedback
       (provider_id, signal_id, message_id, feedback_type, details, actor_id, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id`,
    [
      providerId,
      signalId || null,
      messageId || null,
      feedbackType,
      details ? JSON.stringify(details) : null,
      actorId || null,
      nowIso(),
    ],
  );

  const feedbackId = rows[0]?.id;

  logger.debug({ providerId, feedbackType, feedbackId }, 'Provider DNA feedback recorded');

  if (feedbackType === FEEDBACK_TYPES.USER_CORRECTION) {
    await handleUserCorrection({ providerId, signalId, messageId, details, feedbackId });
  }

  return { feedbackId };
}

async function handleUserCorrection({ providerId, signalId, messageId, details, feedbackId }) {
  if (!details || typeof details !== 'object') {
    return { handled: false };
  }

  const { originalPattern, correctedAction } = details;

  if (!originalPattern || !correctedAction) {
    return { handled: false };
  }

  await db.query(
    `INSERT INTO provider_dna_rules
       (provider_id, rule_type, match_type, pattern, action, priority, enabled, created_at, updated_at)
     VALUES ($1, 'MANAGEMENT_INSTRUCTION', 'CONTAINS', $2, $3, 50, TRUE, $4, $4)
     ON CONFLICT (provider_id, rule_type, pattern) DO UPDATE
       SET action = EXCLUDED.action,
           updated_at = EXCLUDED.updated_at`,
    [
      providerId,
      String(originalPattern).toLowerCase(),
      JSON.stringify({ type: 'MANAGEMENT_INSTRUCTION', value: correctedAction }),
      nowIso(),
    ],
  );

  logger.info({ providerId, originalPattern, correctedAction }, 'Provider DNA rule added from user correction');

  await publishEvent({
    eventType: EVENT_TYPES.PROVIDER_DNA_UPDATED,
    source: 'feedback-loop.service',
    actorId: null,
    payload: {
      providerId,
      signalId: signalId || null,
      messageId: messageId || null,
      reason: 'USER_CORRECTION',
      feedbackId,
    },
  });

  return { handled: true };
}

export async function aggregateProviderFeedback({ providerId, windowDays = 30 }) {
  if (!providerId) {
    throw new AppError('providerId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const since = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000).toISOString();

  const { rows } = await db.query(
    `SELECT feedback_type, COUNT(*)::int AS count
       FROM provider_dna_feedback
      WHERE provider_id = $1 AND created_at >= $2
      GROUP BY feedback_type`,
    [providerId, since],
  );

  const counts = {};
  for (const row of rows) {
    counts[row.feedback_type] = row.count;
  }

  const total =
    (counts.PARSE_SUCCESS || 0) + (counts.PARSE_FAILURE || 0);

  const parseAccuracy = total > 0 ? (counts.PARSE_SUCCESS || 0) / total : 0;

  return {
    providerId,
    windowDays,
    counts,
    parseAccuracy,
    totalFeedback: rows.reduce((acc, r) => acc + r.count, 0),
  };
}

export async function triggerLearningIfNeeded({ providerId }) {
  if (!providerId) {
    throw new AppError('providerId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const aggregate = await aggregateProviderFeedback({ providerId });

  if (aggregate.totalFeedback < LEARNING_THRESHOLD) {
    return { triggered: false, reason: 'INSUFFICIENT_FEEDBACK', aggregate };
  }

  if (aggregate.parseAccuracy < 0.7) {
    await publishEvent({
      eventType: EVENT_TYPES.PROVIDER_DNA_UPDATED,
      source: 'feedback-loop.service',
      actorId: null,
      payload: {
        providerId,
        reason: 'LOW_PARSE_ACCURACY',
        parseAccuracy: aggregate.parseAccuracy,
      },
    });

    logger.info({ providerId, parseAccuracy: aggregate.parseAccuracy }, 'Provider DNA retraining triggered');

    return { triggered: true, reason: 'LOW_PARSE_ACCURACY', aggregate };
  }

  return { triggered: false, reason: 'ACCURACY_ACCEPTABLE', aggregate };
}

export async function listRecentFeedback({ providerId, limit = 50 }) {
  if (!providerId) {
    throw new AppError('providerId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const { rows } = await db.query(
    `SELECT id, feedback_type, details, signal_id, message_id, created_at
       FROM provider_dna_feedback
      WHERE provider_id = $1
      ORDER BY created_at DESC
      LIMIT $2`,
    [providerId, limit],
  );

  return rows.map((row) => ({
    feedbackId: row.id,
    feedbackType: row.feedback_type,
    details: row.details,
    signalId: row.signal_id,
    messageId: row.message_id,
    createdAt: row.created_at,
  }));
}

export const providerDnaFeedbackLoopService = {
  recordFeedback,
  aggregateProviderFeedback,
  triggerLearningIfNeeded,
  listRecentFeedback,
  FEEDBACK_TYPES,
  LEARNING_THRESHOLD,
};