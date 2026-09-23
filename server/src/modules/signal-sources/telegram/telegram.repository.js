/**
 * Telegram Repository
 *
 * @module signalforge/server/modules/signal-sources/telegram/repository
 */

import { getDatabase } from '../../../bootstrap/initDatabase.js';

export class TelegramRepository {
  constructor(db = null) {
    this.db = db || getDatabase();
  }

  async createConnection(data) {
    const result = await this.db.query(
      `INSERT INTO telegram_connections (
         user_id, source_id, phone_number, country, session_encrypted, status,
         listener_enabled, created_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       RETURNING id, user_id, source_id, phone_number, country, status, listener_enabled, created_at`,
      [
        data.userId,
        data.sourceId || null,
        data.phoneNumber,
        data.country || null,
        data.sessionEncrypted || null,
        data.status || 'PENDING',
        data.listenerEnabled !== false,
      ],
    );
    return result.rows[0];
  }

  async findConnectionById(connectionId) {
    const result = await this.db.query(
      `SELECT id, user_id, source_id, phone_number, country, session_encrypted, status,
              listener_enabled, last_connected_at, last_error, last_error_at,
              created_at, updated_at
         FROM telegram_connections
        WHERE id = $1
        LIMIT 1`,
      [connectionId],
    );
    return result.rows[0] || null;
  }

  async findConnectionByUser(userId) {
    const result = await this.db.query(
      `SELECT id, user_id, source_id, phone_number, country, session_encrypted, status,
              listener_enabled, last_connected_at, last_error, last_error_at,
              created_at, updated_at
         FROM telegram_connections
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 1`,
      [userId],
    );
    return result.rows[0] || null;
  }

  async listActiveConnections() {
    const result = await this.db.query(
      `SELECT id, user_id, source_id, phone_number, country, session_encrypted, status,
              listener_enabled, last_connected_at, created_at, updated_at
         FROM telegram_connections
        WHERE status = 'CONNECTED'
          AND listener_enabled = true
        ORDER BY created_at ASC`,
    );
    return result.rows;
  }

  async updateConnection(connectionId, data) {
    const fields = [];
    const values = [connectionId];
    let index = 2;

    if (data.sessionEncrypted !== undefined) {
      fields.push(`session_encrypted = $${index++}`);
      values.push(data.sessionEncrypted);
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
      return this.findConnectionById(connectionId);
    }

    fields.push('updated_at = NOW()');

    await this.db.query(
      `UPDATE telegram_connections SET ${fields.join(', ')} WHERE id = $1`,
      values,
    );
    return this.findConnectionById(connectionId);
  }

  async deleteConnection(connectionId) {
    await this.db.query(`DELETE FROM telegram_connections WHERE id = $1`, [connectionId]);
  }

  async upsertChannel(data) {
    const result = await this.db.query(
      `INSERT INTO telegram_channels (
         connection_id, user_id, channel_id, channel_name, channel_type,
         opt_in_status, last_message_at, created_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       ON CONFLICT (connection_id, channel_id) DO UPDATE SET
         channel_name = COALESCE(EXCLUDED.channel_name, telegram_channels.channel_name),
         channel_type = COALESCE(EXCLUDED.channel_type, telegram_channels.channel_type),
         opt_in_status = EXCLUDED.opt_in_status,
         last_message_at = COALESCE(EXCLUDED.last_message_at, telegram_channels.last_message_at),
         updated_at = NOW()
       RETURNING id, connection_id, channel_id, channel_name, channel_type, opt_in_status`,
      [
        data.connectionId,
        data.userId,
        data.channelId,
        data.channelName || null,
        data.channelType || null,
        data.optInStatus || 'OPTED_OUT',
        data.lastMessageAt || null,
      ],
    );
    return result.rows[0];
  }

  async listChannels(connectionId, filters = {}) {
    const conditions = ['connection_id = $1'];
    const values = [connectionId];

    if (filters.optInStatus) {
      conditions.push(`opt_in_status = $2`);
      values.push(filters.optInStatus);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;

    const result = await this.db.query(
      `SELECT id, connection_id, channel_id, channel_name, channel_type,
              opt_in_status, last_message_at, created_at, updated_at
         FROM telegram_channels
         ${where}
        ORDER BY channel_name ASC NULLS LAST`,
      values,
    );
    return result.rows;
  }

  async findChannel(connectionId, channelId) {
    const result = await this.db.query(
      `SELECT id, connection_id, channel_id, channel_name, channel_type, opt_in_status
         FROM telegram_channels
        WHERE connection_id = $1 AND channel_id = $2
        LIMIT 1`,
      [connectionId, channelId],
    );
    return result.rows[0] || null;
  }

  async updateChannelOptIn(connectionId, channelId, status) {
    await this.db.query(
      `UPDATE telegram_channels
          SET opt_in_status = $3,
              updated_at = NOW()
        WHERE connection_id = $1 AND channel_id = $2`,
      [connectionId, channelId, status],
    );
  }

  async listOptedInChannels(connectionId) {
    const result = await this.db.query(
      `SELECT id, channel_id, channel_name, channel_type, last_message_at
         FROM telegram_channels
        WHERE connection_id = $1
          AND opt_in_status = 'OPTED_IN'
        ORDER BY channel_name ASC`,
      [connectionId],
    );
    return result.rows;
  }
}

export default TelegramRepository;