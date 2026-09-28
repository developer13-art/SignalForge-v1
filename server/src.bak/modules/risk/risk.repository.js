/**
 * Risk Repository
 *
 * @module signalforge/server/modules/risk/repository
 */

import { getDatabase } from '../../bootstrap/initDatabase.js';

export class RiskRepository {
  constructor(db = null) {
    this.db = db || getDatabase();
  }

  async findProfileByUserId(userId) {
    const result = await this.db.query(
      `SELECT id, user_id, broker_account_id, risk_percent, max_daily_loss,
              max_drawdown_percent, max_open_trades, max_lot_size, max_spread_pips,
              max_slippage_pips, trailing_stop_enabled, trailing_stop_pips,
              break_even_enabled, break_even_pips, profit_lock_enabled, profit_lock_pips,
              partial_close_enabled, partial_close_percent, correlation_protection_enabled,
              max_correlated_positions, news_filter_enabled, news_filter_minutes_before,
              news_filter_minutes_after, emergency_stop_enabled, emergency_stop_active,
              allowed_symbols, blocked_symbols, allowed_providers, blocked_providers,
              trading_sessions, created_at, updated_at
         FROM risk_profiles
        WHERE user_id = $1
          AND (broker_account_id IS NULL OR broker_account_id IS NOT DISTINCT FROM $2)
        ORDER BY created_at DESC
        LIMIT 1`,
      [userId, null],
    );
    return result.rows[0] || null;
  }

  async findProfileByUserAndAccount(userId, brokerAccountId) {
    const result = await this.db.query(
      `SELECT id, user_id, broker_account_id, risk_percent, max_daily_loss,
              max_drawdown_percent, max_open_trades, max_lot_size, max_spread_pips,
              max_slippage_pips, trailing_stop_enabled, trailing_stop_pips,
              break_even_enabled, break_even_pips, profit_lock_enabled, profit_lock_pips,
              partial_close_enabled, partial_close_percent, correlation_protection_enabled,
              max_correlated_positions, news_filter_enabled, news_filter_minutes_before,
              news_filter_minutes_after, emergency_stop_enabled, emergency_stop_active,
              allowed_symbols, blocked_symbols, allowed_providers, blocked_providers,
              trading_sessions, created_at, updated_at
         FROM risk_profiles
        WHERE user_id = $1
          AND broker_account_id = $2
        LIMIT 1`,
      [userId, brokerAccountId],
    );
    return result.rows[0] || null;
  }

  async findProfileById(profileId) {
    const result = await this.db.query(
      `SELECT id, user_id, broker_account_id, risk_percent, max_daily_loss,
              max_drawdown_percent, max_open_trades, max_lot_size, max_spread_pips,
              max_slippage_pips, trailing_stop_enabled, trailing_stop_pips,
              break_even_enabled, break_even_pips, profit_lock_enabled, profit_lock_pips,
              partial_close_enabled, partial_close_percent, correlation_protection_enabled,
              max_correlated_positions, news_filter_enabled, news_filter_minutes_before,
              news_filter_minutes_after, emergency_stop_enabled, emergency_stop_active,
              allowed_symbols, blocked_symbols, allowed_providers, blocked_providers,
              trading_sessions, created_at, updated_at
         FROM risk_profiles
        WHERE id = $1
        LIMIT 1`,
      [profileId],
    );
    return result.rows[0] || null;
  }

  async createProfile(data) {
    const result = await this.db.query(
      `INSERT INTO risk_profiles (
         user_id, broker_account_id, risk_percent, max_daily_loss, max_drawdown_percent,
         max_open_trades, max_lot_size, max_spread_pips, max_slippage_pips,
         trailing_stop_enabled, trailing_stop_pips, break_even_enabled, break_even_pips,
         profit_lock_enabled, profit_lock_pips, partial_close_enabled, partial_close_percent,
         correlation_protection_enabled, max_correlated_positions, news_filter_enabled,
         news_filter_minutes_before, news_filter_minutes_after, emergency_stop_enabled,
         emergency_stop_active, allowed_symbols, blocked_symbols, allowed_providers,
         blocked_providers, trading_sessions, created_at, updated_at
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
         $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, NOW(), NOW()
       )
       RETURNING id, user_id, broker_account_id, created_at`,
      [
        data.userId,
        data.brokerAccountId || null,
        data.riskPercent,
        data.maxDailyLoss,
        data.maxDrawdownPercent,
        data.maxOpenTrades,
        data.maxLotSize,
        data.maxSpreadPips,
        data.maxSlippagePips,
        data.trailingStopEnabled,
        data.trailingStopPips,
        data.breakEvenEnabled,
        data.breakEvenPips,
        data.profitLockEnabled,
        data.profitLockPips,
        data.partialCloseEnabled,
        data.partialClosePercent,
        data.correlationProtectionEnabled,
        data.maxCorrelatedPositions,
        data.newsFilterEnabled,
        data.newsFilterMinutesBefore,
        data.newsFilterMinutesAfter,
        data.emergencyStopEnabled,
        false,
        data.allowedSymbols || [],
        data.blockedSymbols || [],
        data.allowedProviders || [],
        data.blockedProviders || [],
        data.tradingSessions || [],
      ],
    );
    return result.rows[0];
  }

  async updateProfile(profileId, data) {
    const fields = [];
    const values = [profileId];
    let index = 2;

    const mapping = {
      riskPercent: 'risk_percent',
      maxDailyLoss: 'max_daily_loss',
      maxDrawdownPercent: 'max_drawdown_percent',
      maxOpenTrades: 'max_open_trades',
      maxLotSize: 'max_lot_size',
      maxSpreadPips: 'max_spread_pips',
      maxSlippagePips: 'max_slippage_pips',
      trailingStopEnabled: 'trailing_stop_enabled',
      trailingStopPips: 'trailing_stop_pips',
      breakEvenEnabled: 'break_even_enabled',
      breakEvenPips: 'break_even_pips',
      profitLockEnabled: 'profit_lock_enabled',
      profitLockPips: 'profit_lock_pips',
      partialCloseEnabled: 'partial_close_enabled',
      partialClosePercent: 'partial_close_percent',
      correlationProtectionEnabled: 'correlation_protection_enabled',
      maxCorrelatedPositions: 'max_correlated_positions',
      newsFilterEnabled: 'news_filter_enabled',
      newsFilterMinutesBefore: 'news_filter_minutes_before',
      newsFilterMinutesAfter: 'news_filter_minutes_after',
      emergencyStopEnabled: 'emergency_stop_enabled',
      emergencyStopActive: 'emergency_stop_active',
      allowedSymbols: 'allowed_symbols',
      blockedSymbols: 'blocked_symbols',
      allowedProviders: 'allowed_providers',
      blockedProviders: 'blocked_providers',
      tradingSessions: 'trading_sessions',
    };

    for (const [key, column] of Object.entries(mapping)) {
      if (data[key] !== undefined) {
        fields.push(`${column} = $${index++}`);
        values.push(data[key]);
      }
    }

    if (fields.length === 0) {
      return this.findProfileById(profileId);
    }

    fields.push('updated_at = NOW()');

    await this.db.query(
      `UPDATE risk_profiles SET ${fields.join(', ')} WHERE id = $1`,
      values,
    );

    return this.findProfileById(profileId);
  }

  async deleteProfile(profileId) {
    await this.db.query('DELETE FROM risk_profiles WHERE id = $1', [profileId]);
  }

  async createDecision(data) {
    const result = await this.db.query(
      `INSERT INTO risk_decisions (
         signal_id, trade_id, user_id, broker_account_id, profile_id, decision,
         approved_volume, approved_risk_percent, checks, failed_checks, reason,
         duration_ms, metadata, created_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
       RETURNING id, signal_id, decision, approved_volume, duration_ms, created_at`,
      [
        data.signalId || null,
        data.tradeId || null,
        data.userId,
        data.brokerAccountId || null,
        data.profileId || null,
        data.decision,
        data.approvedVolume ?? null,
        data.approvedRiskPercent ?? null,
        data.checks ? JSON.stringify(data.checks) : null,
        data.failedChecks ? JSON.stringify(data.failedChecks) : null,
        data.reason || null,
        data.durationMs ?? null,
        data.metadata ? JSON.stringify(data.metadata) : null,
      ],
    );
    return result.rows[0];
  }

  async findDecisionById(decisionId) {
    const result = await this.db.query(
      `SELECT id, signal_id, trade_id, user_id, broker_account_id, profile_id, decision,
              approved_volume, approved_risk_percent, checks, failed_checks, reason,
              duration_ms, metadata, created_at
         FROM risk_decisions
        WHERE id = $1
        LIMIT 1`,
      [decisionId],
    );
    return result.rows[0] || null;
  }

  async findDecisionsBySignal(signalId) {
    const result = await this.db.query(
      `SELECT id, signal_id, trade_id, user_id, decision, approved_volume,
              failed_checks, duration_ms, created_at
         FROM risk_decisions
        WHERE signal_id = $1
        ORDER BY created_at DESC`,
      [signalId],
    );
    return result.rows;
  }

  async listDecisions(filters = {}, pagination = {}) {
    const conditions = [];
    const values = [];
    let index = 1;

    if (filters.userId) {
      conditions.push(`user_id = $${index++}`);
      values.push(filters.userId);
    }

    if (filters.decision) {
      conditions.push(`decision = $${index++}`);
      values.push(filters.decision);
    }

    if (filters.since) {
      conditions.push(`created_at >= $${index++}`);
      values.push(filters.since);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const limit = Math.min(Math.max(Number(pagination.limit) || 20, 1), 200);
    const offset = Math.max(Number(pagination.offset) || 0, 0);

    const countResult = await this.db.query(
      `SELECT COUNT(*)::int AS total FROM risk_decisions ${where}`,
      values,
    );
    const total = countResult.rows[0]?.total || 0;

    const result = await this.db.query(
      `SELECT id, signal_id, trade_id, user_id, broker_account_id, decision,
              approved_volume, failed_checks, duration_ms, created_at
         FROM risk_decisions
         ${where}
         ORDER BY created_at DESC
         LIMIT $${index++} OFFSET $${index++}`,
      [...values, limit, offset],
    );

    return { decisions: result.rows, total, limit, offset };
  }

  async countDecisionsByResult(filters = {}) {
    const conditions = [];
    const values = [];
    let index = 1;

    if (filters.since) {
      conditions.push(`created_at >= $${index++}`);
      values.push(filters.since);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await this.db.query(
      `SELECT decision, COUNT(*)::int AS count
         FROM risk_decisions
         ${where}
        GROUP BY decision`,
      values,
    );
    return result.rows;
  }

  async createRiskEvent(data) {
    const result = await this.db.query(
      `INSERT INTO risk_events (
         user_id, broker_account_id, trade_id, event_type, severity, message,
         details, created_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING id, event_type, severity, created_at`,
      [
        data.userId,
        data.brokerAccountId || null,
        data.tradeId || null,
        data.eventType,
        data.severity,
        data.message,
        data.details ? JSON.stringify(data.details) : null,
      ],
    );
    return result.rows[0];
  }

  async listRiskEvents(filters = {}, pagination = {}) {
    const conditions = [];
    const values = [];
    let index = 1;

    if (filters.userId) {
      conditions.push(`user_id = $${index++}`);
      values.push(filters.userId);
    }

    if (filters.severity) {
      conditions.push(`severity = $${index++}`);
      values.push(filters.severity);
    }

    if (filters.eventType) {
      conditions.push(`event_type = $${index++}`);
      values.push(filters.eventType);
    }

    if (filters.since) {
      conditions.push(`created_at >= $${index++}`);
      values.push(filters.since);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const limit = Math.min(Math.max(Number(pagination.limit) || 20, 1), 200);
    const offset = Math.max(Number(pagination.offset) || 0, 0);

    const result = await this.db.query(
      `SELECT id, user_id, broker_account_id, trade_id, event_type, severity,
              message, details, created_at
         FROM risk_events
         ${where}
         ORDER BY created_at DESC
         LIMIT $${index++} OFFSET $${index++}`,
      [...values, limit, offset],
    );

    return { events: result.rows, limit, offset };
  }

  async getDailyLoss(userId, brokerAccountId, date) {
    const result = await this.db.query(
      `SELECT COALESCE(SUM(realized_profit), 0)::numeric AS total_loss
         FROM trades
        WHERE user_id = $1
          AND ($2::uuid IS NULL OR broker_account_id = $2)
          AND status IN ('CLOSED', 'ARCHIVED')
          AND closed_at::date = $3::date`,
      [userId, brokerAccountId || null, date],
    );
    return Number(result.rows[0]?.total_loss || 0);
  }

  async getCurrentOpenTradesCount(userId, brokerAccountId = null) {
    const result = await this.db.query(
      `SELECT COUNT(*)::int AS count
         FROM trades
        WHERE user_id = $1
          AND ($2::uuid IS NULL OR broker_account_id = $2)
          AND status IN ('OPEN', 'BREAK_EVEN', 'TRAILING_STOP', 'PARTIAL_CLOSE', 'PENDING_ORDER')`,
      [userId, brokerAccountId],
    );
    return result.rows[0]?.count || 0;
  }

  async getOpenTradesForCorrelation(userId, brokerAccountId = null) {
    const result = await this.db.query(
      `SELECT id, symbol, direction, volume, remaining_volume, status, opened_at
         FROM trades
        WHERE user_id = $1
          AND ($2::uuid IS NULL OR broker_account_id = $2)
          AND status IN ('OPEN', 'BREAK_EVEN', 'TRAILING_STOP', 'PARTIAL_CLOSE')
        ORDER BY opened_at DESC`,
      [userId, brokerAccountId],
    );
    return result.rows;
  }
}

export default RiskRepository;