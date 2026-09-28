/**
 * Signal Validation Repository
 *
 * @module signalforge/server/modules/validation/repository
 */

import { getDatabase } from '../../bootstrap/initDatabase.js';

export class ValidationRepository {
  constructor(db = null) {
    this.db = db || getDatabase();
  }

  async createValidation(data) {
    const result = await this.db.query(
      `INSERT INTO signal_validations (
         signal_id, provider_id, source_id, user_id, result, checks,
         failed_checks, reason, duration_ms, metadata, created_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
       RETURNING id, signal_id, result, failed_checks, duration_ms, created_at`,
      [
        data.signalId || null,
        data.providerId || null,
        data.sourceId || null,
        data.userId || null,
        data.result,
        data.checks ? JSON.stringify(data.checks) : null,
        data.failedChecks ? JSON.stringify(data.failedChecks) : null,
        data.reason || null,
        data.durationMs ?? null,
        data.metadata ? JSON.stringify(data.metadata) : null,
      ],
    );
    return result.rows[0];
  }

  async findById(validationId) {
    const result = await this.db.query(
      `SELECT id, signal_id, provider_id, source_id, user_id, result, checks,
              failed_checks, reason, duration_ms, metadata, created_at
         FROM signal_validations
        WHERE id = $1
        LIMIT 1`,
      [validationId],
    );
    return result.rows[0] || null;
  }

  async findLatestBySignal(signalId) {
    const result = await this.db.query(
      `SELECT id, signal_id, provider_id, source_id, user_id, result, checks,
              failed_checks, reason, duration_ms, metadata, created_at
         FROM signal_validations
        WHERE signal_id = $1
        ORDER BY created_at DESC
        LIMIT 1`,
      [signalId],
    );
    return result.rows[0] || null;
  }

  async listBySignal(signalId) {
    const result = await this.db.query(
      `SELECT id, signal_id, result, failed_checks, duration_ms, created_at
         FROM signal_validations
        WHERE signal_id = $1
        ORDER BY created_at DESC`,
      [signalId],
    );
    return result.rows;
  }

  async list(filters = {}, pagination = {}) {
    const conditions = [];
    const values = [];
    let index = 1;

    if (filters.result) {
      conditions.push(`result = $${index++}`);
      values.push(filters.result);
    }

    if (filters.providerId) {
      conditions.push(`provider_id = $${index++}`);
      values.push(filters.providerId);
    }

    if (filters.sourceId) {
      conditions.push(`source_id = $${index++}`);
      values.push(filters.sourceId);
    }

    if (filters.since) {
      conditions.push(`created_at >= $${index++}`);
      values.push(filters.since);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const limit = Math.min(Math.max(Number(pagination.limit) || 20, 1), 200);
    const offset = Math.max(Number(pagination.offset) || 0, 0);

    const countResult = await this.db.query(
      `SELECT COUNT(*)::int AS total FROM signal_validations ${where}`,
      values,
    );
    const total = countResult.rows[0]?.total || 0;

    const result = await this.db.query(
      `SELECT id, signal_id, provider_id, source_id, user_id, result,
              failed_checks, duration_ms, created_at
         FROM signal_validations
         ${where}
         ORDER BY created_at DESC
         LIMIT $${index++} OFFSET $${index++}`,
      [...values, limit, offset],
    );

    return { validations: result.rows, total, limit, offset };
  }

  async countByResult(filters = {}) {
    const conditions = [];
    const values = [];
    let index = 1;

    if (filters.since) {
      conditions.push(`created_at >= $${index++}`);
      values.push(filters.since);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await this.db.query(
      `SELECT result, COUNT(*)::int AS count
         FROM signal_validations
         ${where}
        GROUP BY result`,
      values,
    );
    return result.rows;
  }

  async createDuplicate(data) {
    const result = await this.db.query(
      `INSERT INTO signal_duplicates (
         signal_id, duplicate_signal_id, fingerprint, similarity, window_seconds,
         provider_id, reason, metadata, created_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
       RETURNING id, signal_id, duplicate_signal_id, similarity, created_at`,
      [
        data.signalId,
        data.duplicateSignalId,
        data.fingerprint || null,
        data.similarity ?? null,
        data.windowSeconds ?? null,
        data.providerId || null,
        data.reason || null,
        data.metadata ? JSON.stringify(data.metadata) : null,
      ],
    );
    return result.rows[0];
  }

  async findDuplicatesBySignal(signalId) {
    const result = await this.db.query(
      `SELECT id, signal_id, duplicate_signal_id, fingerprint, similarity, created_at
         FROM signal_duplicates
        WHERE signal_id = $1 OR duplicate_signal_id = $1
        ORDER BY created_at DESC`,
      [signalId],
    );
    return result.rows;
  }

  async createConflict(data) {
    const result = await this.db.query(
      `INSERT INTO signal_conflicts (
         signal_id, conflicting_signal_id, symbol, direction, conflicting_direction,
         provider_id, conflicting_provider_id, window_seconds, resolved, resolution,
         metadata, created_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
       RETURNING id, signal_id, conflicting_signal_id, symbol, resolved, created_at`,
      [
        data.signalId,
        data.conflictingSignalId,
        data.symbol || null,
        data.direction || null,
        data.conflictingDirection || null,
        data.providerId || null,
        data.conflictingProviderId || null,
        data.windowSeconds ?? null,
        data.resolved === true,
        data.resolution || null,
        data.metadata ? JSON.stringify(data.metadata) : null,
      ],
    );
    return result.rows[0];
  }

  async findConflictsBySignal(signalId) {
    const result = await this.db.query(
      `SELECT id, signal_id, conflicting_signal_id, symbol, direction,
              conflicting_direction, resolved, resolution, created_at
         FROM signal_conflicts
        WHERE signal_id = $1 OR conflicting_signal_id = $1
        ORDER BY created_at DESC`,
      [signalId],
    );
    return result.rows;
  }

  async findUnresolvedConflictsBySymbol(symbol, since) {
    const result = await this.db.query(
      `SELECT id, signal_id, conflicting_signal_id, symbol, direction,
              conflicting_direction, created_at
         FROM signal_conflicts
        WHERE symbol = $1
          AND resolved = false
          AND created_at >= $2
        ORDER BY created_at DESC`,
      [symbol, since],
    );
    return result.rows;
  }
}

export default ValidationRepository;