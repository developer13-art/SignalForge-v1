/**
 * Signal Source Repository
 *
 * @module signalforge/server/modules/signal-sources/repository
 */

import { getDatabase } from '../../bootstrap/initDatabase.js';

export class SourceRepository {
  constructor(db = null) {
    this.db = db || getDatabase();
  }

  async create(data) {
    const result = await this.db.query(
      `INSERT INTO signal_sources (
         user_id, source_type, name, status, connection_config, metadata,
         listener_enabled, created_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       RETURNING id, user_id, source_type, name, status, listener_enabled, created_at, updated_at`,
      [
        data.userId,
        data.sourceType,
        data.name,
        data.status || 'PENDING',
        data.connectionConfig ? JSON.stringify(data.connectionConfig) : null,
        data.metadata ? JSON.stringify(data.metadata) : null,
        data.listenerEnabled !== false,
      ],
    );
    return result.rows[0];
  }

  async findById(sourceId) {
    const result = await this.db.query(
      `SELECT id, user_id, source_type, name, status, connection_config, metadata,
              listener_enabled, last_error, last_error_at, last_connected_at,
              created_at, updated_at
         FROM signal_sources
        WHERE id = $1
        LIMIT 1`,
      [sourceId],
    );
    return result.rows[0] || null;
  }

  async findByIdForUser(sourceId, userId) {
    const result = await this.db.query(
      `SELECT id, user_id, source_type, name, status, connection_config, metadata,
              listener_enabled, last_error, last_error_at, last_connected_at,
              created_at, updated_at
         FROM signal_sources
        WHERE id = $1 AND user_id = $2
        LIMIT 1`,
      [sourceId, userId],
    );
    return result.rows[0] || null;
  }

  async listForUser(userId, filters = {}) {
    const conditions = ['user_id = $1'];
    const values = [userId];
    let index = 2;

    if (filters.sourceType) {
      conditions.push(`source_type = $${index++}`);
      values.push(filters.sourceType);
    }

    if (filters.status) {
      conditions.push(`status = $${index++}`);
      values.push(filters.status);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;

    const result = await this.db.query(
      `SELECT id, user_id, source_type, name, status, listener_enabled,
              last_connected_at, last_error, created_at, updated_at
         FROM signal_sources
         ${where}
         ORDER BY created_at DESC`,
      values,
    );
    return result.rows;
  }

  async listActive() {
    const result = await this.db.query(
      `SELECT id, user_id, source_type, name, status, connection_config, metadata,
              listener_enabled, last_connected_at, created_at, updated_at
         FROM signal_sources
        WHERE status = 'CONNECTED'
          AND listener_enabled = true
        ORDER BY created_at ASC`,
    );
    return result.rows;
  }

  async update(sourceId, userId, data) {
    const fields = [];
    const values = [sourceId, userId];
    let index = 3;

    if (data.name !== undefined) {
      fields.push(`name = $${index++}`);
      values.push(data.name);
    }
    if (data.status !== undefined) {
      fields.push(`status = $${index++}`);
      values.push(data.status);
    }
    if (data.listenerEnabled !== undefined) {
      fields.push(`listener_enabled = $${index++}`);
      values.push(data.listenerEnabled);
    }
    if (data.connectionConfig !== undefined) {
      fields.push(`connection_config = $${index++}`);
      values.push(data.connectionConfig ? JSON.stringify(data.connectionConfig) : null);
    }
    if (data.metadata !== undefined) {
      fields.push(`metadata = $${index++}`);
      values.push(data.metadata ? JSON.stringify(data.metadata) : null);
    }
    if (data.lastError !== undefined) {
      fields.push(`last_error = $${index++}`);
      values.push(data.lastError);
    }
    if (data.lastErrorAt !== undefined) {
      fields.push(`last_error_at = $${index++}`);
      values.push(data.lastErrorAt);
    }
    if (data.lastConnectedAt !== undefined) {
      fields.push(`last_connected_at = $${index++}`);
      values.push(data.lastConnectedAt);
    }

    if (fields.length === 0) {
      return this.findByIdForUser(sourceId, userId);
    }

    fields.push('updated_at = NOW()');

    await this.db.query(
      `UPDATE signal_sources
          SET ${fields.join(', ')}
        WHERE id = $1 AND user_id = $2`,
      values,
    );

    return this.findByIdForUser(sourceId, userId);
  }

  async updateStatus(sourceId, status, options = {}) {
    const fields = ['status = $2', 'updated_at = NOW()'];
    const values = [sourceId, status];
    let index = 3;

    if (options.lastConnectedAt !== undefined) {
      fields.push(`last_connected_at = $${index++}`);
      values.push(options.lastConnectedAt);
    }
    if (options.lastError !== undefined) {
      fields.push(`last_error = $${index++}`);
      values.push(options.lastError);
    }
    if (options.lastErrorAt !== undefined) {
      fields.push(`last_error_at = $${index++}`);
      values.push(options.lastErrorAt);
    }

    await this.db.query(
      `UPDATE signal_sources SET ${fields.join(', ')} WHERE id = $1`,
      values,
    );
  }

  async delete(sourceId, userId) {
    await this.db.query(
      `DELETE FROM signal_sources WHERE id = $1 AND user_id = $2`,
      [sourceId, userId],
    );
  }

  async countForUser(userId) {
    const result = await this.db.query(
      `SELECT COUNT(*)::int AS count FROM signal_sources WHERE user_id = $1`,
      [userId],
    );
    return result.rows[0]?.count || 0;
  }
}

export default SourceRepository;