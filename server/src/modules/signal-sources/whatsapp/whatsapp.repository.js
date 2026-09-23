/**
 * WhatsApp Repository
 *
 * @module signalforge/server/modules/signal-sources/whatsapp/repository
 */

import { getDatabase } from '../../../bootstrap/initDatabase.js';

export class WhatsAppRepository {
  constructor(db = null) {
    this.db = db || getDatabase();
  }

  async createConnection(data) {
    const result = await this.db.query(
      `INSERT INTO whatsapp_connections (
         user_id, source_id, phone_number_id, business_account_id, group_ids,
         access_token_encrypted, verify_token, status, listener_enabled,
         created_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
       RETURNING id, user_id, source_id, phone_number_id, status, listener_enabled, created_at`,
      [
        data.userId,
        data.sourceId || null,
        data.phoneNumberId,
        data.businessAccountId || null,
        data.groupIds || [],
        data.accessTokenEncrypted || null,
        data.verifyToken || null,
        data.status || 'PENDING',
        data.listenerEnabled !== false,
      ],
    );
    return result.rows[0];
  }

  async findConnectionByUser(userId) {
    const result = await this.db.query(
      `SELECT id, user_id, source_id, phone_number_id, business_account_id, group_ids,
              access_token_encrypted, verify_token, status, listener_enabled,
              last_connected_at, last_error, last_error_at, created_at, updated_at
         FROM whatsapp_connections
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
      groupIds: 'group_ids',
      status: 'status',
      lastConnectedAt: 'last_connected_at',
      lastError: 'last_error',
      lastErrorAt: 'last_error_at',
      listenerEnabled: 'listener_enabled',
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
      `UPDATE whatsapp_connections SET ${fields.join(', ')} WHERE id = $1`,
      values,
    );
  }

  async deleteConnection(connectionId) {
    await this.db.query(`DELETE FROM whatsapp_connections WHERE id = $1`, [connectionId]);
  }
}

export default WhatsAppRepository;