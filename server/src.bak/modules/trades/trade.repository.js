/**
 * Trades Repository
 *
 * @module signalforge/server/modules/trades/repository
 */

import { getDatabase } from '../../bootstrap/initDatabase.js';

export class TradeRepository {
  constructor(db = null) {
    this.db = db || getDatabase();
  }

  async findById(tradeId) {
    const result = await this.db.query(
      `SELECT t.id, t.trade_id, t.user_id, t.broker_account_id, t.signal_id,
              t.provider_id, t.parent_trade_id, t.symbol, t.normalized_symbol,
              t.direction, t.entry_type, t.requested_price, t.entry_price,
              t.exit_price, t.volume, t.remaining_volume, t.stop_loss, t.take_profit,
              t.take_profits, t.magic_number, t.broker_order_id, t.broker_position_id,
              t.broker_ticket, t.platform, t.account_type, t.status, t.realized_profit,
              t.unrealized_profit, t.commission, t.swap, t.opened_at, t.closed_at,
              t.opened_by, t.closed_by, t.rejection_reason, t.metadata,
              t.created_at, t.updated_at,
              b.account_number AS broker_account_number,
              b.server AS broker_server,
              b.account_currency AS broker_account_currency
         FROM trades t
         LEFT JOIN broker_accounts b ON b.id = t.broker_account_id
        WHERE t.id = $1 OR t.trade_id = $1
        LIMIT 1`,
      [tradeId],
    );
    return result.rows[0] || null;
  }

  async findByIdForUser(tradeId, userId) {
    const result = await this.db.query(
      `SELECT t.id, t.trade_id, t.user_id, t.broker_account_id, t.signal_id,
              t.provider_id, t.symbol, t.normalized_symbol, t.direction, t.entry_type,
              t.requested_price, t.entry_price, t.exit_price, t.volume,
              t.remaining_volume, t.stop_loss, t.take_profit, t.take_profits,
              t.magic_number, t.broker_order_id, t.broker_position_id, t.broker_ticket,
              t.platform, t.account_type, t.status, t.realized_profit, t.unrealized_profit,
              t.commission, t.swap, t.opened_at, t.closed_at, t.opened_by, t.closed_by,
              t.rejection_reason, t.metadata, t.created_at, t.updated_at
         FROM trades t
        WHERE (t.id = $1 OR t.trade_id = $1) AND t.user_id = $2
        LIMIT 1`,
      [tradeId, userId],
    );
    return result.rows[0] || null;
  }

  async findBySignalId(signalId) {
    const result = await this.db.query(
      `SELECT id, trade_id, user_id, broker_account_id, symbol, direction,
              volume, remaining_volume, entry_price, exit_price, status,
              realized_profit, opened_at, closed_at, created_at
         FROM trades
        WHERE signal_id = $1
        ORDER BY created_at DESC`,
      [signalId],
    );
    return result.rows;
  }

  async findByBrokerTicket(ticket) {
    const result = await this.db.query(
      `SELECT id, trade_id, user_id, broker_account_id, symbol, direction,
              volume, remaining_volume, status, created_at
         FROM trades
        WHERE broker_ticket = $1 OR broker_position_id = $1 OR broker_order_id = $1
        LIMIT 1`,
      [String(ticket)],
    );
    return result.rows[0] || null;
  }

  async listTrades(filters = {}, pagination = {}) {
    const conditions = [];
    const values = [];
    let index = 1;

    if (filters.userId) {
      conditions.push(`t.user_id = $${index++}`);
      values.push(filters.userId);
    }

    if (filters.brokerAccountId) {
      conditions.push(`t.broker_account_id = $${index++}`);
      values.push(filters.brokerAccountId);
    }

    if (filters.providerId) {
      conditions.push(`t.provider_id = $${index++}`);
      values.push(filters.providerId);
    }

    if (filters.symbol) {
      conditions.push(`t.normalized_symbol = $${index++}`);
      values.push(filters.symbol);
    }

    if (filters.direction) {
      conditions.push(`t.direction = $${index++}`);
      values.push(filters.direction);
    }

    if (filters.status) {
      if (Array.isArray(filters.status)) {
        conditions.push(`t.status = ANY($${index++}::text[])`);
        values.push(filters.status);
      } else {
        conditions.push(`t.status = $${index++}`);
        values.push(filters.status);
      }
    }

    if (filters.since) {
      conditions.push(`t.created_at >= $${index++}`);
      values.push(filters.since);
    }

    if (filters.until) {
      conditions.push(`t.created_at <= $${index++}`);
      values.push(filters.until);
    }

    if (filters.openedAfter) {
      conditions.push(`t.opened_at >= $${index++}`);
      values.push(filters.openedAfter);
    }

    if (filters.closedAfter) {
      conditions.push(`t.closed_at >= $${index++}`);
      values.push(filters.closedAfter);
    }

    if (filters.search) {
      conditions.push(
        `(t.symbol ILIKE $${index} OR t.normalized_symbol ILIKE $${index})`,
      );
      values.push(`%${filters.search}%`);
      index++;
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const limit = Math.min(Math.max(Number(pagination.limit) || 20, 1), 200);
    const offset = Math.max(Number(pagination.offset) || 0, 0);

    const countResult = await this.db.query(
      `SELECT COUNT(*)::int AS total FROM trades t ${where}`,
      values,
    );
    const total = countResult.rows[0]?.total || 0;

    const result = await this.db.query(
      `SELECT t.id, t.trade_id, t.user_id, t.broker_account_id, t.provider_id,
              t.symbol, t.normalized_symbol, t.direction, t.entry_type,
              t.entry_price, t.exit_price, t.volume, t.remaining_volume,
              t.stop_loss, t.take_profit, t.status, t.realized_profit,
              t.unrealized_profit, t.commission, t.swap, t.opened_at,
              t.closed_at, t.created_at
         FROM trades t
         ${where}
        ORDER BY t.created_at DESC
        LIMIT $${index++} OFFSET $${index++}`,
      [...values, limit, offset],
    );

    return { trades: result.rows, total, limit, offset };
  }

  async listOpenPositions(userId, filters = {}, pagination = {}) {
    return this.listTrades(
      {
        ...filters,
        userId,
        status: ['OPEN', 'BREAK_EVEN', 'TRAILING_STOP', 'PARTIAL_CLOSE'],
      },
      pagination,
    );
  }

  async listPendingOrders(userId, filters = {}, pagination = {}) {
    return this.listTrades(
      {
        ...filters,
        userId,
        status: ['PENDING_ORDER'],
      },
      pagination,
    );
  }

  async listClosedTrades(userId, filters = {}, pagination = {}) {
    return this.listTrades(
      {
        ...filters,
        userId,
        status: ['CLOSED', 'ARCHIVED'],
      },
      pagination,
    );
  }

  async create(data) {
    const result = await this.db.query(
      `INSERT INTO trades (
         trade_id, user_id, broker_account_id, signal_id, provider_id, parent_trade_id,
         symbol, normalized_symbol, direction, entry_type, requested_price, entry_price,
         exit_price, volume, remaining_volume, stop_loss, take_profit, take_profits,
         magic_number, broker_order_id, broker_position_id, broker_ticket, platform,
         account_type, status, realized_profit, unrealized_profit, commission, swap,
         opened_at, closed_at, opened_by, closed_by, rejection_reason, metadata,
         created_at, updated_at
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
         $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32,
         $33, $34, $35, NOW(), NOW()
       )
       RETURNING id, trade_id, user_id, symbol, direction, status, created_at`,
      [
        data.tradeId,
        data.userId,
        data.brokerAccountId,
        data.signalId || null,
        data.providerId || null,
        data.parentTradeId || null,
        data.symbol,
        data.normalizedSymbol || data.symbol,
        data.direction,
        data.entryType || 'MARKET',
        data.requestedPrice ?? null,
        data.entryPrice ?? null,
        data.exitPrice ?? null,
        data.volume,
        data.remainingVolume ?? data.volume,
        data.stopLoss ?? null,
        data.takeProfit ?? null,
        data.takeProfits ? JSON.stringify(data.takeProfits) : null,
        data.magicNumber ?? null,
        data.brokerOrderId || null,
        data.brokerPositionId || null,
        data.brokerTicket || null,
        data.platform || null,
        data.accountType || null,
        data.status,
        data.realizedProfit ?? null,
        data.unrealizedProfit ?? null,
        data.commission ?? null,
        data.swap ?? null,
        data.openedAt || null,
        data.closedAt || null,
        data.openedBy || null,
        data.closedBy || null,
        data.rejectionReason || null,
        data.metadata ? JSON.stringify(data.metadata) : null,
      ],
    );
    return result.rows[0];
  }

  async update(tradeId, data) {
    const fields = [];
    const values = [tradeId];
    let index = 2;

    const mapping = {
      status: 'status',
      entryPrice: 'entry_price',
      exitPrice: 'exit_price',
      volume: 'volume',
      remainingVolume: 'remaining_volume',
      stopLoss: 'stop_loss',
      takeProfit: 'take_profit',
      magicNumber: 'magic_number',
      brokerOrderId: 'broker_order_id',
      brokerPositionId: 'broker_position_id',
      brokerTicket: 'broker_ticket',
      realizedProfit: 'realized_profit',
      unrealizedProfit: 'unrealized_profit',
      commission: 'commission',
      swap: 'swap',
      openedAt: 'opened_at',
      closedAt: 'closed_at',
      openedBy: 'opened_by',
      closedBy: 'closed_by',
      rejectionReason: 'rejection_reason',
    };

    for (const [key, column] of Object.entries(mapping)) {
      if (data[key] !== undefined) {
        fields.push(`${column} = $${index++}`);
        values.push(data[key]);
      }
    }

    if (data.takeProfits !== undefined) {
      fields.push(`take_profits = $${index++}`);
      values.push(data.takeProfits ? JSON.stringify(data.takeProfits) : null);
    }
    if (data.metadata !== undefined) {
      fields.push(`metadata = $${index++}`);
      values.push(data.metadata ? JSON.stringify(data.metadata) : null);
    }

    if (fields.length === 0) {
      return this.findById(tradeId);
    }

    fields.push('updated_at = NOW()');

    await this.db.query(
      `UPDATE trades SET ${fields.join(', ')} WHERE id = $1 OR trade_id = $1`,
      values,
    );

    return this.findById(tradeId);
  }

  async countByStatus(userId, filters = {}) {
    const conditions = ['user_id = $1'];
    const values = [userId];
    let index = 2;

    if (filters.since) {
      conditions.push(`created_at >= $${index++}`);
      values.push(filters.since);
    }

    if (filters.brokerAccountId) {
      conditions.push(`broker_account_id = $${index++}`);
      values.push(filters.brokerAccountId);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;

    const result = await this.db.query(
      `SELECT status, COUNT(*)::int AS count
         FROM trades
         ${where}
        GROUP BY status`,
      values,
    );
    return result.rows;
  }

  async countBySymbol(userId, filters = {}, limit = 50) {
    const conditions = ['user_id = $1'];
    const values = [userId];
    let index = 2;

    if (filters.since) {
      conditions.push(`created_at >= $${index++}`);
      values.push(filters.since);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;

    const result = await this.db.query(
      `SELECT normalized_symbol AS symbol, COUNT(*)::int AS count
         FROM trades
         ${where}
        GROUP BY normalized_symbol
        ORDER BY count DESC
        LIMIT $${index}`,
      [...values, limit],
    );
    return result.rows;
  }

  async sumRealizedProfit(userId, filters = {}) {
    const conditions = [
      'user_id = $1',
      'realized_profit IS NOT NULL',
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
      `SELECT
         COALESCE(SUM(realized_profit), 0)::numeric AS total,
         COALESCE(SUM(commission), 0)::numeric AS commission,
         COALESCE(SUM(swap), 0)::numeric AS swap,
         COUNT(*)::int AS count
         FROM trades
         ${where}`,
      values,
    );

    const row = result.rows[0] || {};
    return {
      total: Number(row.total || 0),
      commission: Number(row.commission || 0),
      swap: Number(row.swap || 0),
      net: Number(row.total || 0) - Number(row.commission || 0) - Number(row.swap || 0),
      count: row.count || 0,
    };
  }

  async getOpenTradesForCorrelation(userId, brokerAccountId = null) {
    const values = [userId];
    let query = `
      SELECT id, trade_id, symbol, normalized_symbol, direction, volume,
             remaining_volume, entry_price, status, opened_at
        FROM trades
       WHERE user_id = $1
         AND status IN ('OPEN', 'BREAK_EVEN', 'TRAILING_STOP', 'PARTIAL_CLOSE')
    `;
    if (brokerAccountId) {
      query += ` AND broker_account_id = $2`;
      values.push(brokerAccountId);
    }
    query += ` ORDER BY opened_at DESC`;
    const result = await this.db.query(query, values);
    return result.rows;
  }

  async findByProvider(userId, providerId, filters = {}, pagination = {}) {
    return this.listTrades(
      {
        ...filters,
        userId,
        providerId,
      },
      pagination,
    );
  }

  async delete(tradeId) {
    await this.db.query('DELETE FROM trades WHERE id = $1', [tradeId]);
  }
}

export default TradeRepository;