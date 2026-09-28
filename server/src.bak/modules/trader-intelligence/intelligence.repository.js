/**
 * Trader Intelligence Repository
 *
 * @module signalforge/server/modules/trader-intelligence/repository
 */

import { getDatabase } from '../../bootstrap/initDatabase.js';

export class IntelligenceRepository {
  constructor(db = null) {
    this.db = db || getDatabase();
  }

  async getClosedTrades(userId, filters = {}) {
    const conditions = [
      'user_id = $1',
      "status IN ('CLOSED', 'ARCHIVED')",
      'closed_at IS NOT NULL',
    ];
    const values = [userId];
    let index = 2;

    if (filters.since) {
      conditions.push(`closed_at >= $${index++}`);
      values.push(filters.since);
    }
    if (filters.until) {
      conditions.push(`closed_at <= $${index++}`);
      values.push(filters.until);
    }
    if (filters.symbol) {
      conditions.push(`normalized_symbol = $${index++}`);
      values.push(filters.symbol);
    }

    const limit = Math.min(
      Math.max(Number(filters.limit) || 500, 1),
      5000,
    );

    const result = await this.db.query(
      `SELECT id, trade_id, symbol, normalized_symbol, direction, volume,
              entry_price, exit_price, stop_loss, take_profit, realized_profit,
              commission, swap, opened_at, closed_at, status
         FROM trades
         WHERE ${conditions.join(' AND ')}
        ORDER BY closed_at ASC
        LIMIT $${index}`,
      [...values, limit],
    );
    return result.rows;
  }

  async getOpenTrades(userId) {
    const result = await this.db.query(
      `SELECT id, trade_id, symbol, normalized_symbol, direction, volume,
              entry_price, stop_loss, take_profit, unrealized_profit,
              opened_at, created_at
         FROM trades
        WHERE user_id = $1
          AND status IN ('OPEN', 'BREAK_EVEN', 'TRAILING_STOP', 'PARTIAL_CLOSE')
        ORDER BY opened_at DESC`,
      [userId],
    );
    return result.rows;
  }

  async findSnapshotByUser(userId, window = 'ALL_TIME') {
    const result = await this.db.query(
      `SELECT id, user_id, window, trading_style, risk_style, behavior_category,
              consistency_score, discipline_score, average_holding_minutes,
              martingale_score, grid_score, news_exposure_score,
              recovery_score, average_rr, discipline_alerts, analysis,
              computed_at, created_at, updated_at
         FROM trader_intelligence_snapshots
        WHERE user_id = $1 AND window = $2
        LIMIT 1`,
      [userId, window],
    );
    return result.rows[0] || null;
  }

  async upsertSnapshot(data) {
    const result = await this.db.query(
      `INSERT INTO trader_intelligence_snapshots (
         user_id, window, trading_style, risk_style, behavior_category,
         consistency_score, discipline_score, average_holding_minutes,
         martingale_score, grid_score, news_exposure_score, recovery_score,
         average_rr, discipline_alerts, analysis, computed_at, created_at, updated_at
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
         NOW(), NOW(), NOW()
       )
       ON CONFLICT (user_id, window) DO UPDATE
       SET trading_style = EXCLUDED.trading_style,
           risk_style = EXCLUDED.risk_style,
           behavior_category = EXCLUDED.behavior_category,
           consistency_score = EXCLUDED.consistency_score,
           discipline_score = EXCLUDED.discipline_score,
           average_holding_minutes = EXCLUDED.average_holding_minutes,
           martingale_score = EXCLUDED.martingale_score,
           grid_score = EXCLUDED.grid_score,
           news_exposure_score = EXCLUDED.news_exposure_score,
           recovery_score = EXCLUDED.recovery_score,
           average_rr = EXCLUDED.average_rr,
           discipline_alerts = EXCLUDED.discipline_alerts,
           analysis = EXCLUDED.analysis,
           computed_at = NOW(),
           updated_at = NOW()
       RETURNING id, user_id, window, trading_style, risk_style, behavior_category,
                 consistency_score, discipline_score, computed_at`,
      [
        data.userId,
        data.window,
        data.tradingStyle || null,
        data.riskStyle || null,
        data.behaviorCategory || null,
        data.consistencyScore ?? null,
        data.disciplineScore ?? null,
        data.averageHoldingMinutes ?? null,
        data.martingaleScore ?? null,
        data.gridScore ?? null,
        data.newsExposureScore ?? null,
        data.recoveryScore ?? null,
        data.averageRr ?? null,
        data.disciplineAlerts ? JSON.stringify(data.disciplineAlerts) : null,
        data.analysis ? JSON.stringify(data.analysis) : null,
      ],
    );
    return result.rows[0];
  }

  async listSnapshots(userId) {
    const result = await this.db.query(
      `SELECT id, user_id, window, trading_style, risk_style, behavior_category,
              consistency_score, discipline_score, computed_at, created_at, updated_at
         FROM trader_intelligence_snapshots
        WHERE user_id = $1
        ORDER BY window ASC`,
      [userId],
    );
    return result.rows;
  }

  async createTimelineEvent(data) {
    const result = await this.db.query(
      `INSERT INTO trader_behavior_timeline (
         user_id, event_type, reference_id, score, details, metadata,
         occurred_at, created_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING id, user_id, event_type, score, occurred_at, created_at`,
      [
        data.userId,
        data.eventType,
        data.referenceId || null,
        data.score ?? null,
        data.details ? JSON.stringify(data.details) : null,
        data.metadata ? JSON.stringify(data.metadata) : null,
        data.occurredAt || new Date(),
      ],
    );
    return result.rows[0];
  }

  async listTimeline(userId, filters = {}, pagination = {}) {
    const conditions = ['user_id = $1'];
    const values = [userId];
    let index = 2;

    if (filters.eventType) {
      conditions.push(`event_type = $${index++}`);
      values.push(filters.eventType);
    }

    if (filters.since) {
      conditions.push(`occurred_at >= $${index++}`);
      values.push(filters.since);
    }

    if (filters.until) {
      conditions.push(`occurred_at <= $${index++}`);
      values.push(filters.until);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const limit = Math.min(Math.max(Number(pagination.limit) || 50, 1), 500);
    const offset = Math.max(Number(pagination.offset) || 0, 0);

    const countResult = await this.db.query(
      `SELECT COUNT(*)::int AS total FROM trader_behavior_timeline ${where}`,
      values,
    );
    const total = countResult.rows[0]?.total || 0;

    const result = await this.db.query(
      `SELECT id, user_id, event_type, reference_id, score, details, metadata,
              occurred_at, created_at
         FROM trader_behavior_timeline
         ${where}
        ORDER BY occurred_at DESC
        LIMIT $${index++} OFFSET $${index++}`,
      [...values, limit, offset],
    );

    return { events: result.rows, total, limit, offset };
  }

  async deleteTimeline(userId) {
    await this.db.query('DELETE FROM trader_behavior_timeline WHERE user_id = $1', [
      userId,
    ]);
  }
}

export default IntelligenceRepository;