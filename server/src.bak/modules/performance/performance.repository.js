/**
 * Performance Repository
 *
 * @module signalforge/server/modules/performance/repository
 */

import { getDatabase } from '../../bootstrap/initDatabase.js';

export class PerformanceRepository {
  constructor(db = null) {
    this.db = db || getDatabase();
  }

  async createPeriod(data) {
    const result = await this.db.query(
      `INSERT INTO performance_periods (
         user_id, broker_account_id, settlement_period, period_type, status,
         opening_balance, closing_balance, gross_profit, gross_loss,
         trading_costs, eligible_net_profit, trade_count, win_count, loss_count,
         started_at, ends_at, frozen_at, closed_at, metadata, created_at, updated_at
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
         $17, $18, $19, NOW(), NOW()
       )
       ON CONFLICT (user_id, broker_account_id, settlement_period) DO NOTHING
       RETURNING id, user_id, broker_account_id, settlement_period, status,
                 opening_balance, closing_balance, eligible_net_profit, created_at`,
      [
        data.userId,
        data.brokerAccountId || null,
        data.settlementPeriod,
        data.periodType || 'MONTHLY',
        data.status || 'OPEN',
        data.openingBalance ?? null,
        data.closingBalance ?? null,
        data.grossProfit ?? 0,
        data.grossLoss ?? 0,
        data.tradingCosts ?? 0,
        data.eligibleNetProfit ?? 0,
        data.tradeCount ?? 0,
        data.winCount ?? 0,
        data.lossCount ?? 0,
        data.startedAt || null,
        data.endsAt || null,
        data.frozenAt || null,
        data.closedAt || null,
        data.metadata ? JSON.stringify(data.metadata) : null,
      ],
    );
    return result.rows[0] || null;
  }

  async findPeriodById(periodId) {
    const result = await this.db.query(
      `SELECT id, user_id, broker_account_id, settlement_period, period_type, status,
              opening_balance, closing_balance, gross_profit, gross_loss,
              trading_costs, eligible_net_profit, trade_count, win_count, loss_count,
              started_at, ends_at, frozen_at, closed_at, metadata, created_at, updated_at
         FROM performance_periods
        WHERE id = $1
        LIMIT 1`,
      [periodId],
    );
    return result.rows[0] || null;
  }

  async findPeriodByKey(userId, brokerAccountId, settlementPeriod) {
    const result = await this.db.query(
      `SELECT id, user_id, broker_account_id, settlement_period, period_type, status,
              opening_balance, closing_balance, gross_profit, gross_loss,
              trading_costs, eligible_net_profit, trade_count, win_count, loss_count,
              started_at, ends_at, frozen_at, closed_at, metadata, created_at, updated_at
         FROM performance_periods
        WHERE user_id = $1
          AND (broker_account_id IS NOT DISTINCT FROM $2)
          AND settlement_period = $3
        LIMIT 1`,
      [userId, brokerAccountId, settlementPeriod],
    );
    return result.rows[0] || null;
  }

  async listPeriods(userId, filters = {}, pagination = {}) {
    const conditions = ['user_id = $1'];
    const values = [userId];
    let index = 2;

    if (filters.brokerAccountId) {
      conditions.push(`broker_account_id = $${index++}`);
      values.push(filters.brokerAccountId);
    }

    if (filters.status) {
      conditions.push(`status = $${index++}`);
      values.push(filters.status);
    }

    if (filters.periodType) {
      conditions.push(`period_type = $${index++}`);
      values.push(filters.periodType);
    }

    if (filters.fromPeriod) {
      conditions.push(`settlement_period >= $${index++}`);
      values.push(filters.fromPeriod);
    }

    if (filters.toPeriod) {
      conditions.push(`settlement_period <= $${index++}`);
      values.push(filters.toPeriod);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const limit = Math.min(Math.max(Number(pagination.limit) || 20, 1), 200);
    const offset = Math.max(Number(pagination.offset) || 0, 0);

    const countResult = await this.db.query(
      `SELECT COUNT(*)::int AS total FROM performance_periods ${where}`,
      values,
    );
    const total = countResult.rows[0]?.total || 0;

    const result = await this.db.query(
      `SELECT id, user_id, broker_account_id, settlement_period, period_type, status,
              opening_balance, closing_balance, gross_profit, gross_loss,
              trading_costs, eligible_net_profit, trade_count, win_count, loss_count,
              started_at, ends_at, frozen_at, closed_at, created_at, updated_at
         FROM performance_periods
         ${where}
        ORDER BY settlement_period DESC
        LIMIT $${index++} OFFSET $${index++}`,
      [...values, limit, offset],
    );

    return { periods: result.rows, total, limit, offset };
  }

  async updatePeriod(periodId, data) {
    const fields = [];
    const values = [periodId];
    let index = 2;

    const mapping = {
      status: 'status',
      openingBalance: 'opening_balance',
      closingBalance: 'closing_balance',
      grossProfit: 'gross_profit',
      grossLoss: 'gross_loss',
      tradingCosts: 'trading_costs',
      eligibleNetProfit: 'eligible_net_profit',
      tradeCount: 'trade_count',
      winCount: 'win_count',
      lossCount: 'loss_count',
      startedAt: 'started_at',
      endsAt: 'ends_at',
      frozenAt: 'frozen_at',
      closedAt: 'closed_at',
    };

    for (const [key, column] of Object.entries(mapping)) {
      if (data[key] !== undefined) {
        fields.push(`${column} = $${index++}`);
        values.push(data[key]);
      }
    }

    if (data.metadata !== undefined) {
      fields.push(`metadata = $${index++}`);
      values.push(data.metadata ? JSON.stringify(data.metadata) : null);
    }

    if (fields.length === 0) {
      return this.findPeriodById(periodId);
    }

    fields.push('updated_at = NOW()');

    await this.db.query(
      `UPDATE performance_periods SET ${fields.join(', ')} WHERE id = $1`,
      values,
    );

    return this.findPeriodById(periodId);
  }

  async deletePeriod(periodId) {
    await this.db.query('DELETE FROM performance_periods WHERE id = $1', [periodId]);
  }

  async findPeriodsToFreeze(referenceTime = new Date()) {
    const result = await this.db.query(
      `SELECT id, user_id, broker_account_id, settlement_period, status, ends_at
         FROM performance_periods
        WHERE status = 'OPEN'
          AND ends_at IS NOT NULL
          AND ends_at < $1`,
      [referenceTime],
    );
    return result.rows;
  }

  async findPeriodsToClose(referenceTime = new Date(), graceHours = 24) {
    const result = await this.db.query(
      `SELECT id, user_id, broker_account_id, settlement_period, status, frozen_at
         FROM performance_periods
        WHERE status = 'FROZEN'
          AND frozen_at IS NOT NULL
          AND frozen_at < NOW() - ($1::int * interval '1 hour')`,
      [graceHours],
    );
    return result.rows;
  }

  async createMetric(data) {
    const result = await this.db.query(
      `INSERT INTO performance_metrics (
         period_id, user_id, metric_type, value, breakdown, computed_at, created_at
       ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       ON CONFLICT (period_id, metric_type) DO UPDATE
       SET value = EXCLUDED.value,
           breakdown = EXCLUDED.breakdown,
           computed_at = NOW()
       RETURNING id, period_id, metric_type, value, computed_at`,
      [
        data.periodId,
        data.userId,
        data.metricType,
        data.value !== undefined ? JSON.stringify(data.value) : null,
        data.breakdown ? JSON.stringify(data.breakdown) : null,
      ],
    );
    return result.rows[0];
  }

  async listMetrics(periodId) {
    const result = await this.db.query(
      `SELECT id, period_id, user_id, metric_type, value, breakdown, computed_at
         FROM performance_metrics
        WHERE period_id = $1
        ORDER BY metric_type ASC`,
      [periodId],
    );
    return result.rows;
  }

  async createEquitySnapshot(data) {
    const result = await this.db.query(
      `INSERT INTO equity_snapshots (
         user_id, broker_account_id, period_id, balance, equity, drawdown,
         drawdown_percent, captured_at, source, metadata, created_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
       RETURNING id, user_id, broker_account_id, balance, equity, captured_at`,
      [
        data.userId,
        data.brokerAccountId || null,
        data.periodId || null,
        data.balance ?? null,
        data.equity ?? null,
        data.drawdown ?? null,
        data.drawdownPercent ?? null,
        data.capturedAt || new Date(),
        data.source || 'SYSTEM',
        data.metadata ? JSON.stringify(data.metadata) : null,
      ],
    );
    return result.rows[0];
  }

  async listEquitySnapshots(userId, filters = {}, pagination = {}) {
    const conditions = ['user_id = $1'];
    const values = [userId];
    let index = 2;

    if (filters.brokerAccountId) {
      conditions.push(`broker_account_id = $${index++}`);
      values.push(filters.brokerAccountId);
    }

    if (filters.periodId) {
      conditions.push(`period_id = $${index++}`);
      values.push(filters.periodId);
    }

    if (filters.since) {
      conditions.push(`captured_at >= $${index++}`);
      values.push(filters.since);
    }

    if (filters.until) {
      conditions.push(`captured_at <= $${index++}`);
      values.push(filters.until);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const limit = Math.min(Math.max(Number(pagination.limit) || 500, 1), 5000);
    const offset = Math.max(Number(pagination.offset) || 0, 0);

    const result = await this.db.query(
      `SELECT id, user_id, broker_account_id, period_id, balance, equity,
              drawdown, drawdown_percent, captured_at, source
         FROM equity_snapshots
         ${where}
        ORDER BY captured_at ASC
        LIMIT $${index++} OFFSET $${index++}`,
      [...values, limit, offset],
    );

    return { snapshots: result.rows, limit, offset };
  }

  async findLatestEquitySnapshot(userId, brokerAccountId = null) {
    const values = [userId];
    let query = `
      SELECT id, user_id, broker_account_id, period_id, balance, equity,
             drawdown, drawdown_percent, captured_at, source
        FROM equity_snapshots
       WHERE user_id = $1
    `;
    if (brokerAccountId) {
      query += ` AND broker_account_id = $2`;
      values.push(brokerAccountId);
    }
    query += ` ORDER BY captured_at DESC LIMIT 1`;
    const result = await this.db.query(query, values);
    return result.rows[0] || null;
  }

  async deleteEquitySnapshotsForPeriod(periodId) {
    await this.db.query('DELETE FROM equity_snapshots WHERE period_id = $1', [periodId]);
  }
}

export default PerformanceRepository;