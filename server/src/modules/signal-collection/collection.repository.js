/**
 * Signal Collection Repository
 *
 * Persists collection items in the `collection_items` table so that
 * work survives process restarts without external queue infrastructure.
 *
 * @module signalforge/server/modules/signal-collection/repository
 */

import { getDatabase } from '../../bootstrap/initDatabase.js';

export class CollectionRepository {
  constructor(db = null) {
    this.db = db || getDatabase();
  }

  async enqueue(data) {
    const result = await this.db.query(
      `INSERT INTO collection_items (
         source_id, message_id, user_id, status, stage, priority,
         payload, attempts, max_attempts, scheduled_for, created_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, COALESCE($10, NOW()), NOW(), NOW())
       ON CONFLICT (message_id) DO NOTHING
       RETURNING id, source_id, message_id, user_id, status, stage, priority,
                 attempts, max_attempts, scheduled_for, created_at`,
      [
        data.sourceId,
        data.messageId,
        data.userId,
        data.status || 'PENDING',
        data.stage || 'RECEIVED',
        data.priority ?? 50,
        data.payload ? JSON.stringify(data.payload) : null,
        0,
        data.maxAttempts ?? 3,
        data.scheduledFor || null,
      ],
    );
    return result.rows[0] || null;
  }

  async findById(itemId) {
    const result = await this.db.query(
      `SELECT id, source_id, message_id, user_id, status, stage, priority,
              payload, attempts, max_attempts, scheduled_for, started_at,
              completed_at, error, created_at, updated_at
         FROM collection_items
        WHERE id = $1
        LIMIT 1`,
      [itemId],
    );
    return result.rows[0] || null;
  }

  async findByMessageId(messageId) {
    const result = await this.db.query(
      `SELECT id, source_id, message_id, user_id, status, stage, priority,
              attempts, max_attempts, scheduled_for, created_at, updated_at
         FROM collection_items
        WHERE message_id = $1
        LIMIT 1`,
      [messageId],
    );
    return result.rows[0] || null;
  }

  async claimBatch(batchSize) {
    return this.db.transaction(async (client) => {
      const result = await client.query(
        `SELECT id, source_id, message_id, user_id, status, stage, priority,
                payload, attempts, max_attempts, scheduled_for
           FROM collection_items
          WHERE status IN ('PENDING', 'QUEUED')
            AND scheduled_for <= NOW()
          ORDER BY priority DESC, scheduled_for ASC, created_at ASC
          LIMIT $1
          FOR UPDATE SKIP LOCKED`,
        [batchSize],
      );

      if (result.rows.length === 0) {
        return [];
      }

      const ids = result.rows.map((row) => row.id);

      await client.query(
        `UPDATE collection_items
            SET status = 'PROCESSING',
                started_at = NOW(),
                attempts = attempts + 1,
                updated_at = NOW()
          WHERE id = ANY($1::bigint[])`,
        [ids],
      );

      return result.rows;
    });
  }

  async markProcessed(itemId) {
    await this.db.query(
      `UPDATE collection_items
          SET status = 'PROCESSED',
              stage = 'COMPLETED',
              completed_at = NOW(),
              updated_at = NOW()
        WHERE id = $1`,
      [itemId],
    );
  }

  async markFailed(itemId, error, attempts, maxAttempts) {
    const isDeadLetter = attempts >= maxAttempts;
    await this.db.query(
      `UPDATE collection_items
          SET status = $2,
              error = $3,
              completed_at = CASE WHEN $2 = 'DEAD_LETTER' THEN NOW() ELSE completed_at END,
              updated_at = NOW()
        WHERE id = $1`,
      [itemId, isDeadLetter ? 'DEAD_LETTER' : 'PENDING', truncateError(error)],
    );
  }

  async updateStage(itemId, stage) {
    await this.db.query(
      `UPDATE collection_items
          SET stage = $2,
              updated_at = NOW()
        WHERE id = $1`,
      [itemId, stage],
    );
  }

  async cancel(itemId) {
    await this.db.query(
      `UPDATE collection_items
          SET status = 'CANCELLED',
              completed_at = NOW(),
              updated_at = NOW()
        WHERE id = $1 AND status IN ('PENDING', 'QUEUED')`,
      [itemId],
    );
  }

  async countByStatus() {
    const result = await this.db.query(
      `SELECT status, COUNT(*)::int AS count
         FROM collection_items
        GROUP BY status`,
    );
    return result.rows;
  }

  async countPending() {
    const result = await this.db.query(
      `SELECT COUNT(*)::int AS count
         FROM collection_items
        WHERE status IN ('PENDING', 'QUEUED')`,
    );
    return result.rows[0]?.count || 0;
  }

  async countProcessing() {
    const result = await this.db.query(
      `SELECT COUNT(*)::int AS count
         FROM collection_items
        WHERE status = 'PROCESSING'`,
    );
    return result.rows[0]?.count || 0;
  }

  async cleanupDeadLetters(olderThanDays) {
    const result = await this.db.query(
      `DELETE FROM collection_items
        WHERE status = 'DEAD_LETTER'
          AND completed_at < NOW() - ($1::int * interval '1 day')`,
      [olderThanDays],
    );
    return result.rowCount;
  }
}

function truncateError(error) {
  const message = error && error.message ? error.message : String(error);
  return message.length > 4000 ? `${message.substring(0, 4000)}...` : message;
}

export default CollectionRepository;