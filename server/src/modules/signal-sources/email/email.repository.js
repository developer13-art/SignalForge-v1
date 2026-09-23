/**
 * Email Repository
 *
 * @module signalforge/server/modules/signal-sources/email/repository
 */

import { getDatabase } from '../../../bootstrap/initDatabase.js';

export class EmailRepository {
  constructor(db = null) {
    this.db = db || getDatabase();
  }

  async createConnection(data) {
    const result = await this.db.query(
      `INSERT INTO email_connections (
         user_id, source_id, host, port, secure, mailbox, username,
         password_encrypted, status, listener_enabled, created_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
       RETURNING id, user_id, source_id, host, port, mailbox, status, listener_enabled, created_at`,
      [
        data.userId,
        data.sourceId || null,
        data.host,
        data.port,
        data.secure !== false,
        data.mailbox || 'INBOX',
        data.username,
        data.passwordEncrypted,
        data.status || 'PENDING',
        data.listenerEnabled !== false,
      ],
    );
    return result.rows[0];
  }

  async findConnectionByUser(userId) {
    const result = await this.db.query(
      `SELECT id, user_id, source_id, host, port, secure, mailbox, username,
              password_encrypted, status, listener_enabled, last_connected_at,
              last_error, last_error_at, created_at, updated_at
         FROM email_connections
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

    const mapping = {
      status: 'status',
      lastConnectedAt: 'last_connected_at',
      lastError: 'last_error',
      lastErrorAt: 'last_error_at',
      listenerEnabled: 'listener_enabled',
      mailbox: 'mailbox',
    };

    for (const [key, column] of Object.entries(mapping)) {
      if (data[key] !== undefined) {
        fields.push(`${column} = $${index++}`);
        values.push(data[key]);
      }
    }

    if (fields.length === 0) {
      return;
    }

    fields.push('updated_at = NOW()');

    await this.db.query(
      `UPDATE email_connections SET ${fields.join(', ')} WHERE id = $1`,
      values,
    );
  }

  async deleteConnection(connectionId) {
    await this.db.query(`DELETE FROM email_connections WHERE id = $1`, [connectionId]);
  }
}

export default EmailRepository;