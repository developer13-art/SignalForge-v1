/**
 * Signal Classification Repository
 *
 * @module signalforge/server/modules/signal-classification/repository
 */

import { getDatabase } from '../../bootstrap/initDatabase.js';

export class ClassificationRepository {
  constructor(db = null) {
    this.db = db || getDatabase();
  }

  async create(data) {
    const result = await this.db.query(
      `INSERT INTO message_classifications (
         message_id, source_id, user_id, classification, confidence,
         classifier_kind, classifier_version, duration_ms, signals,
         metadata, created_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
       RETURNING id, message_id, classification, confidence, classifier_kind,
                 classifier_version, duration_ms, created_at`,
      [
        data.messageId,
        data.sourceId || null,
        data.userId || null,
        data.classification,
        data.confidence,
        data.classifierKind,
        data.classifierVersion || null,
        data.durationMs || null,
        data.signals ? JSON.stringify(data.signals) : null,
        data.metadata ? JSON.stringify(data.metadata) : null,
      ],
    );
    return result.rows[0];
  }

  async findByMessageId(messageId) {
    const result = await this.db.query(
      `SELECT id, message_id, source_id, user_id, classification, confidence,
              classifier_kind, classifier_version, duration_ms, signals,
              metadata, created_at
         FROM message_classifications
        WHERE message_id = $1
        ORDER BY created_at DESC
        LIMIT 1`,
      [messageId],
    );
    return result.rows[0] || null;
  }

  async listByMessageId(messageId) {
    const result = await this.db.query(
      `SELECT id, message_id, classification, confidence, classifier_kind,
              classifier_version, duration_ms, created_at
         FROM message_classifications
        WHERE message_id = $1
        ORDER BY created_at DESC`,
      [messageId],
    );
    return result.rows;
  }

  async list(filters = {}, pagination = {}) {
    const conditions = [];
    const values = [];
    let index = 1;

    if (filters.classification) {
      conditions.push(`classification = $${index++}`);
      values.push(filters.classification);
    }

    if (filters.classifierKind) {
      conditions.push(`classifier_kind = $${index++}`);
      values.push(filters.classifierKind);
    }

    if (filters.minConfidence !== undefined) {
      conditions.push(`confidence >= $${index++}`);
      values.push(filters.minConfidence);
    }

    if (filters.maxConfidence !== undefined) {
      conditions.push(`confidence <= $${index++}`);
      values.push(filters.maxConfidence);
    }

    if (filters.sourceId) {
      conditions.push(`source_id = $${index++}`);
      values.push(filters.sourceId);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const limit = Math.min(Math.max(Number(pagination.limit) || 20, 1), 200);
    const offset = Math.max(Number(pagination.offset) || 0, 0);

    const countResult = await this.db.query(
      `SELECT COUNT(*)::int AS total FROM message_classifications ${where}`,
      values,
    );
    const total = countResult.rows[0]?.total || 0;

    const result = await this.db.query(
      `SELECT id, message_id, source_id, user_id, classification, confidence,
              classifier_kind, duration_ms, created_at
         FROM message_classifications
         ${where}
         ORDER BY created_at DESC
         LIMIT $${index++} OFFSET $${index++}`,
      [...values, limit, offset],
    );

    return { classifications: result.rows, total, limit, offset };
  }

  async countByClassification(filters = {}) {
    const conditions = [];
    const values = [];
    let index = 1;

    if (filters.sourceId) {
      conditions.push(`source_id = $${index++}`);
      values.push(filters.sourceId);
    }

    if (filters.since) {
      conditions.push(`created_at >= $${index++}`);
      values.push(filters.since);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await this.db.query(
      `SELECT classification, COUNT(*)::int AS count
         FROM message_classifications
         ${where}
        GROUP BY classification`,
      values,
    );
    return result.rows;
  }

  async averageConfidence(filters = {}) {
    const conditions = [];
    const values = [];
    let index = 1;

    if (filters.classification) {
      conditions.push(`classification = $${index++}`);
      values.push(filters.classification);
    }

    if (filters.since) {
      conditions.push(`created_at >= $${index++}`);
      values.push(filters.since);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await this.db.query(
      `SELECT AVG(confidence)::numeric AS average, COUNT(*)::int AS count
         FROM message_classifications
         ${where}`,
      values,
    );
    const row = result.rows[0];
    return {
      average: row?.average !== null ? Number(row.average) : null,
      count: row?.count || 0,
    };
  }
}

export default ClassificationRepository;