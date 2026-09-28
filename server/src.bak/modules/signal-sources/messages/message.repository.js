/**
 * Message Repository
 *
 * @module signalforge/server/modules/signal-sources/messages/repository
 */

import { getDatabase } from '../../../bootstrap/initDatabase.js';

export class MessageRepository {
  constructor(db = null) {
    this.db = db || getDatabase();
  }

  async create(data) {
    const result = await this.db.query(
      `INSERT INTO source_messages (
         source_id, user_id, external_message_id, channel_id, sender_id,
         sender_name, message_text, media_reference, reply_to,
         edited, deleted, timestamp, raw_payload_encrypted, processing_status,
         idempotency_key, created_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW())
       ON CONFLICT (idempotency_key) DO NOTHING
       RETURNING id, source_id, external_message_id, processing_status, created_at`,
      [
        data.sourceId,
        data.userId,
        data.externalMessageId,
        data.channelId || null,
        data.senderId || null,
        data.senderName || null,
        data.messageText || '',
        data.mediaReference ? JSON.stringify(data.mediaReference) : null,
        data.replyTo || null,
        data.edited === true,
        data.deleted === true,
        data.timestamp || new Date().toISOString(),
        data.rawPayloadEncrypted || null,
        data.processingStatus || 'RECEIVED',
        data.idempotencyKey,
      ],
    );
    return result.rows[0] || null;
  }

  async findById(messageId) {
    const result = await this.db.query(
      `SELECT id, source_id, user_id, external_message_id, channel_id, sender_id,
              sender_name, message_text, media_reference, reply_to, edited, deleted,
              timestamp, processing_status, error_reason, idempotency_key,
              created_at, updated_at
         FROM source_messages
        WHERE id = $1
        LIMIT 1`,
      [messageId],
    );
    return result.rows[0] || null;
  }

  async findByIdForUser(messageId, userId) {
    const result = await this.db.query(
      `SELECT id, source_id, user_id, external_message_id, channel_id, sender_id,
              sender_name, message_text, media_reference, reply_to, edited, deleted,
              timestamp, processing_status, error_reason, idempotency_key,
              created_at, updated_at
         FROM source_messages
        WHERE id = $1 AND user_id = $2
        LIMIT 1`,
      [messageId, userId],
    );
    return result.rows[0] || null;
  }

  async findByIdempotencyKey(idempotencyKey) {
    const result = await this.db.query(
      `SELECT id, source_id, user_id, external_message_id, processing_status, created_at
         FROM source_messages
        WHERE idempotency_key = $1
        LIMIT 1`,
      [idempotencyKey],
    );
    return result.rows[0] || null;
  }

  async listForSource(sourceId, filters = {}, pagination = {}) {
    const conditions = ['source_id = $1'];
    const values = [sourceId];
    let index = 2;

    if (filters.channelId) {
      conditions.push(`channel_id = $${index++}`);
      values.push(filters.channelId);
    }

    if (filters.processingStatus) {
      conditions.push(`processing_status = $${index++}`);
      values.push(filters.processingStatus);
    }

    if (filters.since) {
      conditions.push(`timestamp >= $${index++}`);
      values.push(filters.since);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const limit = Math.min(Math.max(Number(pagination.limit) || 20, 1), 200);
    const offset = Math.max(Number(pagination.offset) || 0, 0);

    const countResult = await this.db.query(
      `SELECT COUNT(*)::int AS total FROM source_messages ${where}`,
      values,
    );
    const total = countResult.rows[0]?.total || 0;

    const result = await this.db.query(
      `SELECT id, source_id, user_id, external_message_id, channel_id, sender_id,
              sender_name, message_text, media_reference, reply_to, edited, deleted,
              timestamp, processing_status, created_at, updated_at
         FROM source_messages
         ${where}
         ORDER BY timestamp DESC
         LIMIT $${index++} OFFSET $${index++}`,
      [...values, limit, offset],
    );

    return { messages: result.rows, total, limit, offset };
  }

  async updateProcessingStatus(messageId, status, errorReason = null) {
    await this.db.query(
      `UPDATE source_messages
          SET processing_status = $2,
              error_reason = $3,
              updated_at = NOW()
        WHERE id = $1`,
      [messageId, status, errorReason],
    );
  }

  async markEdited(externalMessageId, sourceId, newText) {
    await this.db.query(
      `UPDATE source_messages
          SET message_text = $3,
              edited = true,
              updated_at = NOW()
        WHERE external_message_id = $1 AND source_id = $2`,
      [externalMessageId, sourceId, newText],
    );
  }

  async markDeleted(externalMessageId, sourceId) {
    await this.db.query(
      `UPDATE source_messages
          SET deleted = true,
              updated_at = NOW()
        WHERE external_message_id = $1 AND source_id = $2`,
      [externalMessageId, sourceId],
    );
  }

  async countForSource(sourceId) {
    const result = await this.db.query(
      `SELECT COUNT(*)::int AS count FROM source_messages WHERE source_id = $1`,
      [sourceId],
    );
    return result.rows[0]?.count || 0;
  }
}

export default MessageRepository;