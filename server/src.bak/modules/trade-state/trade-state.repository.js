/**
 * Trade State Repository
 *
 * @module signalforge/server/modules/trade-state/repository
 */

import { getDatabase } from '../../bootstrap/initDatabase.js';

export class TradeStateRepository {
  constructor(db = null) {
    this.db = db || getDatabase();
  }

  async findById(tradeId) {
    const result = await this.db.query(
      `SELECT id, trade_id, user_id, broker_account_id, signal_id, provider_id,
              parent_trade_id, symbol, normalized_symbol, direction, entry_type,
              requested_price, entry_price, exit_price, volume, remaining_volume,
              stop_loss, take_profit, take_profits, magic_number, broker_order_id,
              broker_position_id, broker_ticket, platform, account_type, status,
              realized_profit, unrealized_profit, commission, swap, opened_at,
              closed_at, opened_by, closed_by, rejection_reason, metadata,
              created_at, updated_at
         FROM trades
        WHERE id = $1 OR trade_id = $1
        LIMIT 1`,
      [tradeId],
    );
    return result.rows[0] || null;
  }

  async findBySignalId(signalId) {
    const result = await this.db.query(
      `SELECT id, trade_id, user_id, broker_account_id, symbol, direction,
              volume, remaining_volume, status, opened_at, created_at
         FROM trades
        WHERE signal_id = $1
        ORDER BY created_at DESC
        LIMIT 1`,
      [signalId],
    );
    return result.rows[0] || null;
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

  async listTrades(filters = {}, pagination = {}) {
    const conditions = [];
    const values = [];
    let index = 1;

    if (filters.userId) {
      conditions.push(`user_id = $${index++}`);
      values.push(filters.userId);
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

    if (filters.status) {
      if (Array.isArray(filters.status)) {
        conditions.push(`status = ANY($${index++}::text[])`);
        values.push(filters.status);
      } else {
        conditions.push(`status = $${index++}`);
        values.push(filters.status);
      }
    }

    if (filters.since) {
      conditions.push(`created_at >= $${index++}`);
      values.push(filters.since);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const limit = Math.min(Math.max(Number(pagination.limit) || 20, 1), 200);
    const offset = Math.max(Number(pagination.offset) || 0, 0);

    const countResult = await this.db.query(
      `SELECT COUNT(*)::int AS total FROM trades ${where}`,
      values,
    );
    const total = countResult.rows[0]?.total || 0;

    const result = await this.db.query(
      `SELECT id, trade_id, user_id, broker_account_id, provider_id, symbol,
              normalized_symbol, direction, volume, remaining_volume, entry_price,
              exit_price, stop_loss, take_profit, status, realized_profit,
              opened_at, closed_at, created_at
         FROM trades
         ${where}
         ORDER BY created_at DESC
         LIMIT $${index++} OFFSET $${index++}`,
      [...values, limit, offset],
    );

    return { trades: result.rows, total, limit, offset };
  }

  async createEvent(data) {
    const result = await this.db.query(
      `INSERT INTO trade_events (
         trade_id, user_id, event_type, actor, actor_id, previous_state, new_state,
         payload, severity, metadata, created_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
       RETURNING id, trade_id, event_type, actor, previous_state, new_state,
                 severity, created_at`,
      [
        data.tradeId,
        data.userId || null,
        data.eventType,
        data.actor,
        data.actorId || null,
        data.previousState || null,
        data.newState || null,
        data.payload ? JSON.stringify(data.payload) : null,
        data.severity || 'info',
        data.metadata ? JSON.stringify(data.metadata) : null,
      ],
    );
    return result.rows[0];
  }

  async findEventById(eventId) {
    const result = await this.db.query(
      `SELECT id, trade_id, user_id, event_type, actor, actor_id, previous_state,
              new_state, payload, severity, metadata, created_at
         FROM trade_events
        WHERE id = $1
        LIMIT 1`,
      [eventId],
    );
    return result.rows[0] || null;
  }

  async listEventsByTrade(tradeId, filters = {}, pagination = {}) {
    const conditions = ['trade_id = $1'];
    const values = [tradeId];
    let index = 2;

    if (filters.eventType) {
      conditions.push(`event_type = $${index++}`);
      values.push(filters.eventType);
    }

    if (filters.actor) {
      conditions.push(`actor = $${index++}`);
      values.push(filters.actor);
    }

    if (filters.severity) {
      conditions.push(`severity = $${index++}`);
      values.push(filters.severity);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const limit = Math.min(Math.max(Number(pagination.limit) || 50, 1), 500);
    const offset = Math.max(Number(pagination.offset) || 0, 0);

    const result = await this.db.query(
      `SELECT id, trade_id, user_id, event_type, actor, actor_id, previous_state,
              new_state, payload, severity, metadata, created_at
         FROM trade_events
         ${where}
        ORDER BY created_at ASC
        LIMIT $${index++} OFFSET $${index++}`,
      [...values, limit, offset],
    );

    return { events: result.rows, limit, offset };
  }

  async countEventsByType(tradeId) {
    const result = await this.db.query(
      `SELECT event_type, COUNT(*)::int AS count
         FROM trade_events
        WHERE trade_id = $1
        GROUP BY event_type`,
      [tradeId],
    );
    return result.rows;
  }

  async listEventsByUser(userId, filters = {}, pagination = {}) {
    const conditions = ['user_id = $1'];
    const values = [userId];
    let index = 2;

    if (filters.eventType) {
      conditions.push(`event_type = $${index++}`);
      values.push(filters.eventType);
    }

    if (filters.severity) {
      conditions.push(`severity = $${index++}`);
      values.push(filters.severity);
    }

    if (filters.since) {
      conditions.push(`created_at >= $${index++}`);
      values.push(filters.since);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const limit = Math.min(Math.max(Number(pagination.limit) || 50, 1), 500);
    const offset = Math.max(Number(pagination.offset) || 0, 0);

    const result = await this.db.query(
      `SELECT id, trade_id, user_id, event_type, actor, actor_id, previous_state,
              new_state, severity, created_at
         FROM trade_events
         ${where}
        ORDER BY created_at DESC
        LIMIT $${index++} OFFSET $${index++}`,
      [...values, limit, offset],
    );

    return { events: result.rows, limit, offset };
  }

  async countByStatus(filters = {}) {
    const conditions = [];
    const values = [];
    let index = 1;

    if (filters.userId) {
      conditions.push(`user_id = $${index++}`);
      values.push(filters.userId);
    }

    if (filters.since) {
      conditions.push(`created_at >= $${index++}`);
      values.push(filters.since);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await this.db.query(
      `SELECT status, COUNT(*)::int AS count
         FROM trades
         ${where}
        GROUP BY status`,
      values,
    );
    return result.rows;
  }
}

export default TradeStateRepository;