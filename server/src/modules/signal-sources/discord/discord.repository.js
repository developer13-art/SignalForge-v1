/**
 * Discord Repository
 *
 * @module signalforge/server/modules/signal-sources/discord/repository
 */

import { getDatabase } from '../../../bootstrap/initDatabase.js';

export class DiscordRepository {
  constructor(db = null) {
    this.db = db || getDatabase();
  }

  async createConnection(data) {
    const result = await this.db.query(
      `INSERT INTO discord_connections (
         user_id, source_id, guild_id, channel_ids, access_token_encrypted,
         refresh_token_encrypted, status, listener_enabled, created_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
       RETURNING id, user_id, source_id, guild_id, status, listener_enabled, created_at`,
      [
        data.userId,
        data.sourceId || null,
        data.guildId || null,
        data.channelIds || [],
        data.accessTokenEncrypted || null,
        data.refreshTokenEncrypted || null,
        data.status || 'PENDING',
        data.listenerEnabled !== false,
      ],
    );
    return result.rows[0];
  }

  async findConnectionByUser(userId) {
    const result = await this.db.query(
      `SELECT id, user_id, source_id, guild_id, channel_ids, access_token_encrypted,
              refresh_token_encrypted, status, listener_enabled, last_connected_at,
              last_error, last_error_at, created_at, updated_at
         FROM discord_connections
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 1`,
      [userId],
    );
    return result.rows[0] || null;
  }

  async updateConnection(connectionId, data) {
    const fields = [];
    const values = [connectionId];
    let index = 2;

    if (data.guildId !== undefined) {
      fields.push(`guild_id = $${index++}`);
      values.push(data.guildId);
    }
    if (data.channelIds !== undefined) {
      fields.push(`channel_ids = $${index++}`);
      values.push(data.channelIds);
    }
    if (data.status !== undefined) {
      fields.push(`status = $${index++}`);
      values.push(data.status);
    }
    if (data.lastConnectedAt !== undefined) {
      fields.push(`last_connected_at = $${index++}`);
      values.push(data.lastConnectedAt);
    }
    if (data.lastError !== undefined) {
      fields.push(`last_error = $${index++}`);
      values.push(data.lastError);
    }
    if (data.lastErrorAt !== undefined) {
      fields.push(`last_error_at = $${index++}`);
      values.push(data.lastErrorAt);
    }
    if (data.listenerEnabled !== undefined) {
      fields.push(`listener_enabled = $${index++}`);
      values.push(data.listenerEnabled);
    }

    if (fields.length === 0) {
      return this.findConnectionByUser(null);
    }

    fields.push('updated_at = NOW()');

    await this.db.query(
      `UPDATE discord_connections SET ${fields.join(', ')} WHERE id = $1`,
      values,
    );
  }

  async deleteConnection(connectionId) {
    await this.db.query(`DELETE FROM discord_connections WHERE id = $1`, [connectionId]);
  }
}

export default DiscordRepository;