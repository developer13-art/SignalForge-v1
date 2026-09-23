/**
 * REST API Source Repository
 *
 * @module signalforge/server/modules/signal-sources/rest-api/repository
 */

import { getDatabase } from '../../../bootstrap/initDatabase.js';

export class RestApiRepository {
  constructor(db = null) {
    this.db = db || getDatabase();
  }

  async createKey(data) {
    const result = await this.db.query(
      `INSERT INTO rest_api_keys (
         user_id, source_id, name, prefix, hashed_key, enabled, last_used_at, created_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       RETURNING id, user_id, source_id, name, prefix, enabled, created_at`,
      [
        data.userId,
        data.sourceId || null,
        data.name,
        data.prefix,
        data.hashedKey,
        data.enabled !== false,
        data.lastUsedAt || null,
      ],
    );
    return result.rows[0];
  }

  async findKeyByPrefix(prefix) {
    const result = await this.db.query(
      `SELECT id, user_id, source_id, name, prefix, hashed_key, enabled,
              last_used_at, created_at, updated_at
         FROM rest_api_keys
        WHERE prefix = $1
        LIMIT 1`,
      [prefix],
    );
    return result.rows[0] || null;
  }

  async listKeysForUser(userId) {
    const result = await this.db.query(
      `SELECT id, user_id, source_id, name, prefix, enabled, last_used_at, created_at, updated_at
         FROM rest_api_keys
        WHERE user_id = $1
        ORDER BY created_at DESC`,
      [userId],
    );
    return result.rows;
  }

  async updateKey(keyId, userId, data) {
    const fields = [];
    const values = [keyId, userId];
    let index = 3;

    if (data.name !== undefined) {
      fields.push(`name = $${index++}`);
      values.push(data.name);
    }
    if (data.enabled !== undefined) {
      fields.push(`enabled = $${index++}`);
      values.push(data.enabled);
    }
    if (data.lastUsedAt !== undefined) {
      fields.push(`last_used_at = $${index++}`);
      values.push(data.lastUsedAt);
    }

    if (fields.length === 0) {
      return;
    }

    fields.push('updated_at = NOW()');

    await this.db.query(
      `UPDATE rest_api_keys SET ${fields.join(', ')} WHERE id = $1 AND user_id = $2`,
      values,
    );
  }

  async deleteKey(keyId, userId) {
    await this.db.query(
      `DELETE FROM rest_api_keys WHERE id = $1 AND user_id = $2`,
      [keyId, userId],
    );
  }
}

export default RestApiRepository;