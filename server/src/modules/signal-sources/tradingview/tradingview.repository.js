/**
 * TradingView Repository
 *
 * @module signalforge/server/modules/signal-sources/tradingview/repository
 */

import { getDatabase } from '../../../bootstrap/initDatabase.js';

export class TradingViewRepository {
  constructor(db = null) {
    this.db = db || getDatabase();
  }

  async createWebhook(data) {
    const result = await this.db.query(
      `INSERT INTO tradingview_webhooks (
         user_id, source_id, name, secret, allowed_ips, enabled, created_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING id, user_id, source_id, name, enabled, created_at`,
      [
        data.userId,
        data.sourceId || null,
        data.name,
        data.secret,
        data.allowedIps || [],
        data.enabled !== false,
      ],
    );
    return result.rows[0];
  }

  async findWebhookById(webhookId) {
    const result = await this.db.query(
      `SELECT id, user_id, source_id, name, secret, allowed_ips, enabled, last_used_at, created_at, updated_at
         FROM tradingview_webhooks
        WHERE id = $1
        LIMIT 1`,
      [webhookId],
    );
    return result.rows[0] || null;
  }

  async findWebhooksByUser(userId) {
    const result = await this.db.query(
      `SELECT id, user_id, source_id, name, enabled, last_used_at, created_at, updated_at
         FROM tradingview_webhooks
        WHERE user_id = $1
        ORDER BY created_at DESC`,
      [userId],
    );
    return result.rows;
  }

  async updateWebhook(webhookId, userId, data) {
    const fields = [];
    const values = [webhookId, userId];
    let index = 3;

    if (data.name !== undefined) {
      fields.push(`name = $${index++}`);
      values.push(data.name);
    }
    if (data.secret !== undefined) {
      fields.push(`secret = $${index++}`);
      values.push(data.secret);
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
      return this.findWebhookById(webhookId);
    }

    fields.push('updated_at = NOW()');

    await this.db.query(
      `UPDATE tradingview_webhooks SET ${fields.join(', ')} WHERE id = $1 AND user_id = $2`,
      values,
    );

    return this.findWebhookById(webhookId);
  }

  async deleteWebhook(webhookId, userId) {
    await this.db.query(
      `DELETE FROM tradingview_webhooks WHERE id = $1 AND user_id = $2`,
      [webhookId, userId],
    );
  }
}

export default TradingViewRepository;