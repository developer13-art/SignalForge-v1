/**
 * Analytics Repository
 *
 * @module signalforge/server/modules/analytics/repository
 */

import { getDatabase } from '../../bootstrap/initDatabase.js';

export class AnalyticsRepository {
  constructor(db = null) {
    this.db = db || getDatabase();
  }

  async getClosedTradesForPeriod(userId, filters = {}) {
    const conditions = [
      "user_id = $1",
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
    if (filters.brokerAccountId) {
      conditions.push(`broker_account_id = $${index++}`);
      values.push(filters.brokerAccountId);
    }
    if (filters.providerId) {
      conditions.push(`provider_id = $${index++}`);
      values.push(filters.providerId);
    }
    if (filters.symbol) {
      conditions.push(`normalized_symbol = $${index++}`);
      values.push(filters.symbol);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;

    const result = await this.db.query(
      `SELECT id, trade_id, user_id, provider_id, broker_account_id, symbol,
              normalized_symbol, direction, volume, entry_price, exit_price,
              stop_loss, take_profit, realized_profit, commission, swap,
              opened_at, closed_at
         FROM trades
         ${where}
        ORDER BY closed_at ASC`,
      values,
    );
    return result.rows;
  }

  async getOpenTradesForPeriod(userId, filters = {}) {
    const conditions = [
      'user_id = $1',
      "status IN ('OPEN', 'BREAK_EVEN', 'TRAILING_STOP', 'PARTIAL_CLOSE')",
    ];
    const values = [userId];
    let index = 2;

    if (filters.brokerAccountId) {
      conditions.push(`broker_account_id = $${index++}`);
      values.push(filters.brokerAccountId);
    }
    if (filters.providerId) {
      conditions.push(`provider_id = $${index++}`);
      values.push(filters.providerId);
    }
    if (filters.symbol) {
      conditions.push(`normalized_symbol = $${index++}`);
      values.push(filters.symbol);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;

    const result = await this.db.query(
      `SELECT id, trade_id, symbol, normalized_symbol, direction, volume,
              entry_price, stop_loss, take_profit, unrealized_profit,
              opened_at, created_at
         FROM trades
         ${where}
        ORDER BY opened_at DESC`,
      values,
    );
    return result.rows;
  }

  async getTradesCountForPeriod(userId, filters = {}) {
    const conditions = ['user_id = $1'];
    const values = [userId];
    let index = 2;

    if (filters.since) {
      conditions.push(`created_at >= $${index++}`);
      values.push(filters.since);
    }
    if (filters.until) {
      conditions.push(`created_at <= $${index++}`);
      values.push(filters.until);
    }
    if (filters.brokerAccountId) {
      conditions.push(`broker_account_id = $${index++}`);
      values.push(filters.brokerAccountId);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;

    const result = await this.db.query(
      `SELECT COUNT(*)::int AS total FROM trades ${where}`,
      values,
    );
    return result.rows[0]?.total || 0;
  }

  async getAccountSnapshots(accountId, filters = {}) {
    const conditions = ['broker_account_id = $1'];
    const values = [accountId];
    let index = 2;

    if (filters.since) {
      conditions.push(`captured_at >= $${index++}`);
      values.push(filters.since);
    }
    if (filters.until) {
      conditions.push(`captured_at <= $${index++}`);
      values.push(filters.until);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;

    const result = await this.db.query(
      `SELECT id, broker_account_id, balance, equity, margin, free_margin,
              margin_level, open_positions, open_orders, captured_at
         FROM account_snapshots
         ${where}
        ORDER BY captured_at ASC`,
      values,
    );
    return result.rows;
  }

  async createMetric(data) {
    const result = await this.db.query(
      `INSERT INTO analytics_metrics (
         user_id, metric_type, period_start, period_end, value, breakdown,
         filters, computed_at, created_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       ON CONFLICT (user_id, metric_type, period_start, period_end) DO UPDATE
       SET value = EXCLUDED.value,
           breakdown = EXCLUDED.breakdown,
           filters = EXCLUDED.filters,
           computed_at = NOW()
       RETURNING id, user_id, metric_type, value, computed_at`,
      [
        data.userId,
        data.metricType,
        data.periodStart || null,
        data.periodEnd || null,
        data.value !== undefined ? JSON.stringify(data.value) : null,
        data.breakdown ? JSON.stringify(data.breakdown) : null,
        data.filters ? JSON.stringify(data.filters) : null,
      ],
    );
    return result.rows[0];
  }

  async findMetric(userId, metricType, filters = {}) {
    const conditions = ['user_id = $1', 'metric_type = $2'];
    const values = [userId, metricType];
    let index = 3;

    if (filters.periodStart) {
      conditions.push(`period_start = $${index++}`);
      values.push(filters.periodStart);
    }
    if (filters.periodEnd) {
      conditions.push(`period_end = $${index++}`);
      values.push(filters.periodEnd);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;

    const result = await this.db.query(
      `SELECT id, user_id, metric_type, period_start, period_end, value,
              breakdown, filters, computed_at
         FROM analytics_metrics
         ${where}
        ORDER BY computed_at DESC
        LIMIT 1`,
      values,
    );
    return result.rows[0] || null;
  }

  async listMetrics(userId, filters = {}) {
    const conditions = ['user_id = $1'];
    const values = [userId];
    let index = 2;

    if (filters.metricType) {
      conditions.push(`metric_type = $${index++}`);
      values.push(filters.metricType);
    }
    if (filters.since) {
      conditions.push(`computed_at >= $${index++}`);
      values.push(filters.since);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;

    const result = await this.db.query(
      `SELECT id, metric_type, period_start, period_end, value, breakdown,
              computed_at
         FROM analytics_metrics
         ${where}
        ORDER BY computed_at DESC`,
      values,
    );
    return result.rows;
  }

  async createReport(data) {
    const result = await this.db.query(
      `INSERT INTO analytics_reports (
         user_id, report_type, format, status, parameters, period_start,
         period_end, file_path, file_size_bytes, error, requested_by,
         started_at, completed_at, created_at, updated_at
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW()
       )
       RETURNING id, user_id, report_type, format, status, created_at`,
      [
        data.userId,
        data.reportType,
        data.format || 'JSON',
        data.status || 'PENDING',
        data.parameters ? JSON.stringify(data.parameters) : null,
        data.periodStart || null,
        data.periodEnd || null,
        data.filePath || null,
        data.fileSizeBytes ?? null,
        data.error || null,
        data.requestedBy || null,
        data.startedAt || null,
        data.completedAt || null,
      ],
    );
    return result.rows[0];
  }

  async findReportById(reportId) {
    const result = await this.db.query(
      `SELECT id, user_id, report_type, format, status, parameters,
              period_start, period_end, file_path, file_size_bytes, error,
              requested_by, started_at, completed_at, expires_at,
              created_at, updated_at
         FROM analytics_reports
        WHERE id = $1
        LIMIT 1`,
      [reportId],
    );
    return result.rows[0] || null;
  }

  async findReportByIdForUser(reportId, userId) {
    const result = await this.db.query(
      `SELECT id, user_id, report_type, format, status, parameters,
              period_start, period_end, file_path, file_size_bytes, error,
              requested_by, started_at, completed_at, expires_at,
              created_at, updated_at
         FROM analytics_reports
        WHERE id = $1 AND user_id = $2
        LIMIT 1`,
      [reportId, userId],
    );
    return result.rows[0] || null;
  }

  async updateReport(reportId, data) {
    const fields = [];
    const values = [reportId];
    let index = 2;

    const mapping = {
      status: 'status',
      filePath: 'file_path',
      fileSizeBytes: 'file_size_bytes',
      error: 'error',
      startedAt: 'started_at',
      completedAt: 'completed_at',
      expiresAt: 'expires_at',
    };

    for (const [key, column] of Object.entries(mapping)) {
      if (data[key] !== undefined) {
        fields.push(`${column} = $${index++}`);
        values.push(data[key]);
      }
    }

    if (data.parameters !== undefined) {
      fields.push(`parameters = $${index++}`);
      values.push(data.parameters ? JSON.stringify(data.parameters) : null);
    }

    if (fields.length === 0) {
      return this.findReportById(reportId);
    }

    fields.push('updated_at = NOW()');

    await this.db.query(
      `UPDATE analytics_reports SET ${fields.join(', ')} WHERE id = $1`,
      values,
    );

    return this.findReportById(reportId);
  }

  async listReports(userId, filters = {}, pagination = {}) {
    const conditions = ['user_id = $1'];
    const values = [userId];
    let index = 2;

    if (filters.reportType) {
      conditions.push(`report_type = $${index++}`);
      values.push(filters.reportType);
    }
    if (filters.status) {
      conditions.push(`status = $${index++}`);
      values.push(filters.status);
    }
    if (filters.since) {
      conditions.push(`created_at >= $${index++}`);
      values.push(filters.since);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const limit = Math.min(Math.max(Number(pagination.limit) || 20, 1), 200);
    const offset = Math.max(Number(pagination.offset) || 0, 0);

    const countResult = await this.db.query(
      `SELECT COUNT(*)::int AS total FROM analytics_reports ${where}`,
      values,
    );
    const total = countResult.rows[0]?.total || 0;

    const result = await this.db.query(
      `SELECT id, user_id, report_type, format, status, period_start,
              period_end, file_size_bytes, error, started_at, completed_at,
              expires_at, created_at
         FROM analytics_reports
         ${where}
        ORDER BY created_at DESC
        LIMIT $${index++} OFFSET $${index++}`,
      [...values, limit, offset],
    );

    return { reports: result.rows, total, limit, offset };
  }

  async deleteReport(reportId) {
    await this.db.query('DELETE FROM analytics_reports WHERE id = $1', [reportId]);
  }

  async aggregateTradesBySymbol(userId, filters = {}) {
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

    const where = `WHERE ${conditions.join(' AND ')}`;

    const result = await this.db.query(
      `SELECT normalized_symbol AS symbol,
              COUNT(*)::int AS trade_count,
              COALESCE(SUM(realized_profit), 0)::numeric AS total_profit,
              COALESCE(AVG(realized_profit), 0)::numeric AS avg_profit,
              COALESCE(SUM(CASE WHEN realized_profit > 0 THEN 1 ELSE 0 END), 0)::int AS win_count,
              COALESCE(SUM(CASE WHEN realized_profit < 0 THEN 1 ELSE 0 END), 0)::int AS loss_count
         FROM trades
         ${where}
        GROUP BY normalized_symbol
        ORDER BY total_profit DESC`,
      values,
    );
    return result.rows;
  }

  async aggregateTradesByProvider(userId, filters = {}) {
    const conditions = [
      'user_id = $1',
      'provider_id IS NOT NULL',
      "status IN ('CLOSED', 'ARCHIVED')",
      'closed_at IS NOT NULL',
    ];
    const values = [userId];
    let index = 2;

    if (filters.since) {
      conditions.push(`closed_at >= $${index++}`);
      values.push(filters.since);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;

    const result = await this.db.query(
      `SELECT provider_id,
              COUNT(*)::int AS trade_count,
              COALESCE(SUM(realized_profit), 0)::numeric AS total_profit,
              COALESCE(AVG(realized_profit), 0)::numeric AS avg_profit,
              COALESCE(SUM(CASE WHEN realized_profit > 0 THEN 1 ELSE 0 END), 0)::int AS win_count,
              COALESCE(SUM(CASE WHEN realized_profit < 0 THEN 1 ELSE 0 END), 0)::int AS loss_count
         FROM trades
         ${where}
        GROUP BY provider_id
        ORDER BY total_profit DESC`,
      values,
    );
    return result.rows;
  }

  async aggregateTradesByDay(userId, filters = {}) {
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

    const where = `WHERE ${conditions.join(' AND ')}`;

    const result = await this.db.query(
      `SELECT DATE(closed_at) AS trading_day,
              COUNT(*)::int AS trade_count,
              COALESCE(SUM(realized_profit), 0)::numeric AS total_profit,
              COALESCE(SUM(CASE WHEN realized_profit > 0 THEN 1 ELSE 0 END), 0)::int AS win_count,
              COALESCE(SUM(CASE WHEN realized_profit < 0 THEN 1 ELSE 0 END), 0)::int AS loss_count
         FROM trades
         ${where}
        GROUP BY DATE(closed_at)
        ORDER BY trading_day ASC`,
      values,
    );
    return result.rows;
  }

  async aggregateLatency(userId, filters = {}) {
    const conditions = ['user_id = $1', 'duration_ms IS NOT NULL'];
    const values = [userId];
    let index = 2;

    if (filters.since) {
      conditions.push(`created_at >= $${index++}`);
      values.push(filters.since);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;

    const result = await this.db.query(
      `SELECT AVG(duration_ms)::numeric AS average_ms,
              MIN(duration_ms)::int AS min_ms,
              MAX(duration_ms)::int AS max_ms,
              COUNT(*)::int AS count,
              PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY duration_ms) AS p95_ms
         FROM execution_requests
         ${where}`,
      values,
    );
    const row = result.rows[0] || {};
    return {
      averageMs: row.average_ms !== null ? Number(row.average_ms) : null,
      minMs: row.min_ms,
      maxMs: row.max_ms,
      p95Ms: row.p95_ms !== null ? Number(row.p95_ms) : null,
      count: row.count || 0,
    };
  }
}

export default AnalyticsRepository;