/**
 * Message Fingerprint Service
 *
 * Computes and stores stable fingerprints for source messages to
 * support duplicate detection across equivalent phrasings and sources.
 * Fingerprints are deterministic and based on canonicalized message
 * content.
 *
 * @module server/modules/signal-sources/messages/message-fingerprint.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { logger } from '../../../lib/logger';
import { buildMessageFingerprint } from '@signalforge/shared/utils/fingerprint.util';
import { db } from '../../../database';
import { nowIso } from '@signalforge/shared/utils/date.util';

export async function computeFingerprint({ userId, messageId }) {
  if (!userId || !messageId) {
    throw new AppError('userId and messageId are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const { rows } = await db.query(
    `SELECT id, source_type, source_id, external_message_id, timestamp, envelope
       FROM source_messages
      WHERE id = $1 AND user_id = $2
      LIMIT 1`,
    [messageId, userId],
  );

  const row = rows[0];

  if (!row) {
    return null;
  }

  const envelope = row.envelope || {};

  const fingerprint = buildMessageFingerprint({
    sourceType: row.source_type,
    sourceId: row.source_id,
    externalMessageId: row.external_message_id,
    timestamp: row.timestamp,
  });

  if (!row.envelope || !row.envelope.fingerprint) {
    await db.query(
      `UPDATE source_messages
          SET fingerprint = $1,
              updated_at = $2
        WHERE id = $3`,
      [fingerprint, nowIso(), messageId],
    );
  }

  return {
    messageId: row.id,
    fingerprint,
    sourceType: row.source_type,
    sourceId: row.source_id,
    externalMessageId: row.external_message_id,
    timestamp: row.timestamp,
    envelope,
  };
}

export async function findByFingerprint({ fingerprint, sourceType }) {
  if (!fingerprint) {
    throw new AppError('fingerprint is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const params = [fingerprint];
  let query = `SELECT id, user_id, source_type, source_id, external_message_id, timestamp
                 FROM source_messages
                WHERE fingerprint = $1`;

  if (sourceType) {
    params.push(sourceType);
    query += ` AND source_type = $2`;
  }

  query += ` ORDER BY timestamp DESC LIMIT 20`;

  const { rows } = await db.query(query, params);

  return rows.map((row) => ({
    messageId: row.id,
    userId: row.user_id,
    sourceType: row.source_type,
    sourceId: row.source_id,
    externalMessageId: row.external_message_id,
    timestamp: row.timestamp,
  }));
}

export async function recordFingerprint({ userId, messageId, fingerprint, sourceType, sourceId, externalMessageId, timestamp }) {
  if (!userId || !messageId || !fingerprint) {
    throw new AppError('userId, messageId, and fingerprint are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  await db.query(
    `INSERT INTO message_fingerprints
       (user_id, message_id, fingerprint, source_type, source_id, external_message_id, timestamp, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (fingerprint, user_id) DO NOTHING`,
    [userId, messageId, fingerprint, sourceType, sourceId, externalMessageId, timestamp, nowIso()],
  );

  logger.debug({ userId, messageId, fingerprint }, 'Message fingerprint recorded');
}

export const messageFingerprintService = {
  computeFingerprint,
  findByFingerprint,
  recordFingerprint,
};