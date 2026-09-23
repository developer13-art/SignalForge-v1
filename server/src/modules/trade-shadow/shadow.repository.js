/**
 * Trade Shadow Repository
 *
 * @module signalforge/server/modules/trade-shadow/repository
 */

import { getDatabase } from '../../bootstrap/initDatabase.js';

export class ShadowRepository {
  constructor(db = null) {
    this.db = db || getDatabase();
  }

  async create(data) {
    const result = await this.db.query(
      `INSERT INTO trade_shadows (
         provider_trade_id, user_trade_id, user_id, provider_id,
         provider_realized_profit, user_realized_profit, missed_profit,
         difference, outcome, reason, divergence_type, divergence_details,
         behavior_category, metadata, created_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
       ON CONFLICT (provider_trade_id, user_trade_id) DO NOTHING
       RETURNING id, provider_trade_id, user_trade_id, user_id, outcome,
                 missed_profit, difference, created_at`,
      [
        data.providerTradeId,
        data.userTradeId,
        data.userId,
        data.providerId || null,
        data.providerRealizedProfit ?? null,
        data.userRealizedProfit ?? null,
        data.missedProfit ?? null,
        data.difference ?? null,
        data.outcome,
        data.reason || null,
        data.divergenceType || null,
        data.divergenceDetails ? JSON.stringify(data.divergenceDetails) : null,
        data.behaviorCategory || null,
        data.metadata ? JSON.stringify(data.metadata) : null,
      ],
    );
    return result.rows[0] || null;
  }

  async findById(shadowId) {
    const result = await this.db.query(
      `SELECT id, provider_trade_id, user_trade_id, user_id, provider_id,
              provider_realized_profit, user_realized_profit, missed_profit,
              difference, outcome, reason, divergence_type, divergence_details,
              behavior_category, metadata, created_at, updated_at
         FROM trade_shadows
        WHERE id = $1
        LIMIT 1`,
      [shadowId],
    );
    return result.rows[0] || null;
  }

  async findByUserTrade(userTradeId) {
    const result = await this.db.query(
      `SELECT id, provider_trade_id, user_trade_id, user_id, outcome,
              missed_profit, difference, divergence_type, created_at
         FROM trade_shadows
        WHERE user_trade_id = $1
        LIMIT 1`,
      [userTradeId],
    );
    return result.rows[0] || null;
  }

  async findByProviderTrade(providerTradeId) {
    const result = await this.db.query(
      `SELECT id, provider_trade_id, user_trade_id, user_id, outcome,
              missed_profit, difference, divergence_type, created_at
         FROM trade_shadows
        WHERE provider_trade_id = $1
        ORDER BY created_at DESC`,
      [providerTradeId],
    );
    return result.rows;
  }

  async update(shadowId, data) {
    const fields = [];
    const values = [shadowId];
    let index = 2;

    const mapping = {
      providerRealizedProfit: 'provider_realized_profit',
      userRealizedProfit: 'user_realized_profit',
      missedProfit: 'missed_profit',
      difference: 'difference',
      outcome: 'outcome',
      reason: 'reason',
      divergenceType: 'divergence_type',
      behaviorCategory: 'behavior_category',
    };

    for (const [key, column] of Object.entries(mapping)) {
      if (data[key] !== undefined) {
        fields.push(`${column} = $${index++}`);
        values.push(data[key]);
      }
    }

    if (data.divergenceDetails !== undefined) {
      fields.push(`divergence_details = $${index++}`);
      values.push(data.divergenceDetails ? JSON.stringify(data.divergenceDetails) : null);
    }
    if (data.metadata !== undefined) {
      fields.push(`metadata = $${index++}`);
      values.push(data.metadata ? JSON.stringify(data.metadata) : null);
    }

    if (fields.length === 0) {
      return this.findById(shadowId);
    }

    fields.push('updated_at = NOW()');

    await this.db.query(
      `UPDATE trade_shadows SET ${fields.join(', ')} WHERE id = $1`,
      values,
    );

    return this.findById(shadowId);
  }

  async listByUser(userId, filters = {}, pagination = {}) {
    const conditions = ['user_id = $1'];
    const values = [userId];
    let index = 2;

    if (filters.outcome) {
      conditions.push(`outcome = $${index++}`);
      values.push(filters.outcome);
    }

    if (filters.divergenceType) {
      conditions.push(`divergence_type = $${index++}`);
      values.push(filters.divergenceType);
    }

    if (filters.behaviorCategory) {
      conditions.push(`behavior_category = $${index++}`);
      values.push(filters.behaviorCategory);
    }

    if (filters.since) {
      conditions.push(`created_at >= $${index++}`);
      values.push(filters.since);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const limit = Math.min(Math.max(Number(pagination.limit) || 20, 1), 200);
    const offset = Math.max(Number(pagination.offset) || 0, 0);

    const countResult = await this.db.query(
      `SELECT COUNT(*)::int AS total FROM trade_shadows ${where}`,
      values,
    );
    const total = countResult.rows[0]?.total || 0;

    const result = await this.db.query(
      `SELECT id, provider_trade_id, user_trade_id, user_id, provider_id,
              provider_realized_profit, user_realized_profit, missed_profit,
              difference, outcome, divergence_type, behavior_category, created_at
         FROM trade_shadows
         ${where}
         ORDER BY created_at DESC
         LIMIT $${index++} OFFSET $${index++}`,
      [...values, limit, offset],
    );

    return { shadows: result.rows, total, limit, offset };
  }

  async countByOutcome(userId, filters = {}) {
    const conditions = ['user_id = $1'];
    const values = [userId];
    let index = 2;

    if (filters.since) {
      conditions.push(`created_at >= $${index++}`);
      values.push(filters.since);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;

    const result = await this.db.query(
      `SELECT outcome, COUNT(*)::int AS count
         FROM trade_shadows
         ${where}
        GROUP BY outcome`,
      values,
    );
    return result.rows;
  }

  async sumMissedProfit(userId, filters = {}) {
    const conditions = ['user_id = $1', 'missed_profit IS NOT NULL'];
    const values = [userId];
    let index = 2;

    if (filters.since) {
      conditions.push(`created_at >= $${index++}`);
      values.push(filters.since);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;

    const result = await this.db.query(
      `SELECT
         COALESCE(SUM(CASE WHEN missed_profit > 0 THEN missed_profit ELSE 0 END), 0)::numeric AS total_missed,
         COALESCE(SUM(CASE WHEN missed_profit < 0 THEN missed_profit ELSE 0 END), 0)::numeric AS total_gained,
         COALESCE(SUM(missed_profit), 0)::numeric AS net,
         COUNT(*)::int AS count
         FROM trade_shadows
         ${where}`,
      values,
    );

    const row = result.rows[0] || {};
    return {
      totalMissed: Number(row.total_missed || 0),
      totalGained: Number(row.total_gained || 0),
      net: Number(row.net || 0),
      count: row.count || 0,
    };
  }

  async countByDivergenceType(userId, filters = {}) {
    const conditions = ['user_id = $1', 'divergence_type IS NOT NULL'];
    const values = [userId];
    let index = 2;

    if (filters.since) {
      conditions.push(`created_at >= $${index++}`);
      values.push(filters.since);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;

    const result = await this.db.query(
      `SELECT divergence_type, COUNT(*)::int AS count
         FROM trade_shadows
         ${where}
        GROUP BY divergence_type
        ORDER BY count DESC`,
      values,
    );
    return result.rows;
  }
}

export default ShadowRepository;