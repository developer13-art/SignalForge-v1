/**
 * Message Raw Store Service
 *
 * Persists every source message before any processing occurs. This is
 * the platform's permanent source of truth for audits, replay, and
 * retraining. Also handles edits, deletes, and the message raw store
 * query API.
 *
 * @module server/modules/signal-sources/messages/message-raw-store.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { logger } from '../../../lib/logger';
import { nowIso } from '@signalforge/shared/utils/date.util';
import { db } from '../../../database';
import { normalizePagination, buildPaginationMeta } from '@signalforge/shared/utils/pagination.util';

export async function persistIncoming({ userId, envelope }) {
  if (!userId || !envelope) {
    throw new AppError('userId and envelope are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (!envelope.idempotencyKey) {
    throw new AppError('envelope.idempotencyKey is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const existing = await db.query(
    `SELECT id FROM source_messages WHERE idempotency_key = $1 LIMIT 1`,
    [envelope.idempotencyKey],
  );

  if (existing.rows[0]) {
    return { id: existing.rows[0].id, duplicate: true };
  }

  const { rows } = await db.query(
    `INSERT INTO source_messages
       (user_id, source_type, source_id, channel_id, external_message_id,
        sender_id, sender_name, text, media, reply_to, timestamp,
        idempotency_key, fingerprint, envelope, processing_status,
        is_edited, is_deleted, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'RECEIVED', FALSE, FALSE, $15, $15)
     ON CONFLICT (idempotency_key) DO NOTHING
     RETURNING id`,
    [
      userId,
      envelope.sourceType,
      envelope.sourceId,
      envelope.channelId || null,
      envelope.externalMessageId || null,
      envelope.senderId || null,
      envelope.senderName || null,
      envelope.text || '',
      envelope.media ? JSON.stringify(envelope.media) : null,
      envelope.replyTo || null,
      envelope.timestamp || nowIso(),
      envelope.idempotencyKey,
      envelope.fingerprint || null,
      JSON.stringify(envelope),
      nowIso(),
    ],
  );

  const inserted = rows[0];

  if (!inserted) {
    const conflict = await db.query(
      `SELECT id FROM source_messages WHERE idempotency_key = $1 LIMIT 1`,
      [envelope.idempotencyKey],
    );
    return { id: conflict.rows[0]?.id, duplicate: true };
  }

  logger.debug({ userId, messageId: inserted.id }, 'Source message persisted');

  return { id: inserted.id, duplicate: false };
}

export async function persistEdit({ userId, envelope }) {
  if (!userId || !envelope) {
    throw new AppError('userId and envelope are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const { rows } = await db.query(
    `INSERT INTO source_messages
       (user_id, source_type, source_id, channel_id, external_message_id,
        sender_id, sender_name, text, media, reply_to, timestamp,
        idempotency_key, fingerprint, envelope, processing_status,
        is_edited, is_deleted, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'EDITED', TRUE, FALSE, $15, $15)
     ON CONFLICT (idempotency_key) DO NOTHING
     RETURNING id`,
    [
      userId,
      envelope.sourceType,
      envelope.sourceId,
      envelope.channelId || null,
      envelope.externalMessageId || null,
      envelope.senderId || null,
      envelope.senderName || null,
      envelope.text || '',
      envelope.media ? JSON.stringify(envelope.media) : null,
      envelope.replyTo || null,
      envelope.timestamp || nowIso(),
      envelope.idempotencyKey,
      envelope.fingerprint || null,
      JSON.stringify(envelope),
      nowIso(),
    ],
  );

  const inserted = rows[0];

  if (!inserted) {
    return { duplicate: true };
  }

  await db.query(
    `UPDATE source_messages
        SET is_edited = TRUE,
            processing_status = 'SUPERSEDED',
            updated_at = $1
      WHERE user_id = $2
        AND source_type = $3
        AND source_id = $4
        AND external_message_id = $5
        AND id <> $6`,
    [
      nowIso(),
      userId,
      envelope.sourceType,
      envelope.sourceId,
      envelope.externalMessageId,
      inserted.id,
    ],
  );

  logger.debug({ userId, messageId: inserted.id }, 'Source message edit persisted');

  return { id: inserted.id, duplicate: false };
}

export async function persistDelete({ userId, envelope }) {
  if (!userId || !envelope) {
    throw new AppError('userId and envelope are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const { rows } = await db.query(
    `INSERT INTO source_messages
       (user_id, source_type, source_id, channel_id, external_message_id,
        sender_id, text, timestamp, idempotency_key, envelope,
        processing_status, is_edited, is_deleted, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'DELETED', FALSE, TRUE, $11, $11)
     ON CONFLICT (idempotency_key) DO NOTHING
     RETURNING id`,
    [
      userId,
      envelope.sourceType,
      envelope.sourceId,
      envelope.channelId || null,
      envelope.externalMessageId || null,
      envelope.senderId || null,
      envelope.text || '',
      envelope.timestamp || nowIso(),
      envelope.idempotencyKey,
      JSON.stringify(envelope),
      nowIso(),
    ],
  );

  const inserted = rows[0];

  if (!inserted) {
    return { duplicate: true };
  }

  await db.query(
    `UPDATE source_messages
        SET is_deleted = TRUE,
            processing_status = 'DELETED',
            updated_at = $1
      WHERE user_id = $2
        AND source_type = $3
        AND source_id = $4
        AND external_message_id = $5
        AND id <> $6`,
    [
      nowIso(),
      userId,
      envelope.sourceType,
      envelope.sourceId,
      envelope.externalMessageId,
      inserted.id,
    ],
  );

  logger.debug({ userId, messageId: inserted.id }, 'Source message delete persisted');

  return { id: inserted.id, duplicate: false };
}

export async function getMessageById({ userId, messageId }) {
  if (!userId || !messageId) {
    throw new AppError('userId and messageId are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const { rows } = await db.query(
    `SELECT * FROM source_messages
      WHERE id = $1 AND user_id = $2
      LIMIT 1`,
    [messageId, userId],
  );

  return rows[0] || null;
}

export async function getMessageProcessingStatus({ userId, messageId }) {
  if (!userId || !messageId) {
    throw new AppError('userId and messageId are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const { rows } = await db.query(
    `SELECT id, processing_status, is_edited, is_deleted, created_at, updated_at
       FROM source_messages
      WHERE id = $1 AND user_id = $2
      LIMIT 1`,
    [messageId, userId],
  );

  return rows[0] || null;
}

export async function listMessages({ userId, filters = {}, pagination = {} }) {
  if (!userId) {
    throw new AppError('userId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const { page, limit, offset } = normalizePagination(pagination);

  const conditions = ['user_id = $1'];
  const params = [userId];

  if (filters.sourceType) {
    params.push(filters.sourceType);
    conditions.push(`source_type = $${params.length}`);
  }

  if (filters.channelId) {
    params.push(filters.channelId);
    conditions.push(`channel_id = $${params.length}`);
  }

  if (filters.from) {
    params.push(filters.from);
    conditions.push(`timestamp >= $${params.length}`);
  }

  if (filters.to) {
    params.push(filters.to);
    conditions.push(`timestamp <= $${params.length}`);
  }

  const where = `WHERE ${conditions.join(' AND ')}`;

  const countResult = await db.query(
    `SELECT COUNT(*)::int AS total FROM source_messages ${where}`,
    params,
  );

  const total = countResult.rows[0]?.total || 0;

  const listParams = [...params, limit, offset];

  const { rows } = await db.query(
    `SELECT id, user_id, source_type, source_id, channel_id, external_message_id,
            sender_id, sender_name, text, timestamp, processing_status,
            is_edited, is_deleted, created_at
       FROM source_messages
       ${where}
       ORDER BY timestamp DESC
       LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}`,
    listParams,
  );

  return {
    items: rows,
    meta: buildPaginationMeta({ page, limit, total }),
  };
}

export async function enqueueForReprocessing({ userId, messageId }) {
  if (!userId || !messageId) {
    throw new AppError('userId and messageId are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const message = await getMessageById({ userId, messageId });

  if (!message) {
    throw new AppError('Message not found', ERROR_CODES.NOT_FOUND, 404);
  }

  const { rows } = await db.query(
    `INSERT INTO jobs
       (job_type, payload, status, attempts, max_attempts, scheduled_at, created_at, updated_at)
     VALUES ('CLASSIFY_MESSAGE', $1, 'PENDING', 0, 3, $2, $2, $2)
     RETURNING id`,
    [JSON.stringify({ userId, messageId }), nowIso()],
  );

  return { jobId: rows[0]?.id };
}

export async function softDeleteMessage({ userId, messageId }) {
  if (!userId || !messageId) {
    throw new AppError('userId and messageId are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  await db.query(
    `UPDATE source_messages
        SET is_deleted = TRUE,
            processing_status = 'DELETED',
            updated_at = $1
      WHERE id = $2 AND user_id = $3`,
    [nowIso(), messageId, userId],
  );

  return { deleted: true };
}

export const messageRawStoreService = {
  persistIncoming,
  persistEdit,
  persistDelete,
  getMessageById,
  getMessageProcessingStatus,
  listMessages,
  enqueueForReprocessing,
  softDeleteMessage,
};