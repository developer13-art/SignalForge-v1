/**
 * Trade Matching Repository
 *
 * @module signalforge/server/modules/trade-matching/repository
 */

import { getDatabase } from '../../bootstrap/initDatabase.js';

export class MatchingRepository {
  constructor(db = null) {
    this.db = db || getDatabase();
  }

  async findOpenTradesByProvider(providerId, options = {}) {
    const conditions = [
      "t.status IN ('OPEN', 'BREAK_EVEN', 'TRAILING_STOP', 'PARTIAL_CLOSE', 'PENDING_ORDER')",
      't.provider_id = $1',
    ];
    const values = [providerId];
    let index = 2;

    if (options.symbol) {
      conditions.push(`(t.symbol = $${index} OR t.normalized_symbol = $${index})`);
      values.push(options.symbol);
      index++;
    }

    if (options.afterTimestamp) {
      conditions.push(`t.opened_at >= $${index++}`);
      values.push(options.afterTimestamp);
    }

    const limit = Math.min(options.limit || 200, 200);

    const result = await this.db.query(
      `SELECT t.id, t.trade_id, t.user_id, t.broker_account_id, t.signal_id,
              t.provider_id, t.symbol, t.normalized_symbol, t.direction, t.volume,
              t.remaining_volume, t.entry_price, t.stop_loss, t.take_profit,
              t.broker_ticket, t.broker_position_id, t.broker_order_id,
              t.magic_number, t.status, t.opened_at, t.created_at, t.updated_at
         FROM trades t
         WHERE ${conditions.join(' AND ')}
         ORDER BY t.opened_at DESC
         LIMIT $${index}`,
      [...values, limit],
    );
    return result.rows;
  }

  async findOpenTradesByUser(userId, options = {}) {
    const conditions = [
      "status IN ('OPEN', 'BREAK_EVEN', 'TRAILING_STOP', 'PARTIAL_CLOSE', 'PENDING_ORDER')",
      'user_id = $1',
    ];
    const values = [userId];
    let index = 2;

    if (options.symbol) {
      conditions.push(`(symbol = $${index} OR normalized_symbol = $${index})`);
      values.push(options.symbol);
      index++;
    }

    if (options.providerId) {
      conditions.push(`provider_id = $${index++}`);
      values.push(options.providerId);
    }

    const limit = Math.min(options.limit || 200, 200);

    const result = await this.db.query(
      `SELECT id, trade_id, user_id, broker_account_id, signal_id, provider_id,
              symbol, normalized_symbol, direction, volume, remaining_volume,
              entry_price, stop_loss, take_profit, broker_ticket, broker_position_id,
              broker_order_id, magic_number, status, opened_at, created_at, updated_at
         FROM trades
         WHERE ${conditions.join(' AND ')}
         ORDER BY opened_at DESC
         LIMIT $${index}`,
      [...values, limit],
    );
    return result.rows;
  }

  async findTradeByTicket(ticket) {
    const result = await this.db.query(
      `SELECT id, trade_id, user_id, broker_account_id, provider_id, symbol,
              direction, volume, remaining_volume, entry_price, stop_loss,
              take_profit, broker_ticket, broker_position_id, broker_order_id,
              status, opened_at, created_at, updated_at
         FROM trades
        WHERE broker_ticket = $1 OR broker_position_id = $1 OR broker_order_id = $1
        LIMIT 1`,
      [String(ticket)],
    );
    return result.rows[0] || null;
  }

  async findTradeById(tradeId) {
    const result = await this.db.query(
      `SELECT id, trade_id, user_id, broker_account_id, signal_id, provider_id,
              symbol, normalized_symbol, direction, volume, remaining_volume,
              entry_price, stop_loss, take_profit, broker_ticket, broker_position_id,
              broker_order_id, magic_number, status, opened_at, created_at, updated_at
         FROM trades
        WHERE id = $1 OR trade_id = $1
        LIMIT 1`,
      [tradeId],
    );
    return result.rows[0] || null;
  }

  async findSignalTradesBySignal(signalId) {
    const result = await this.db.query(
      `SELECT id, trade_id, user_id, broker_account_id, provider_id, symbol,
              direction, volume, remaining_volume, entry_price, stop_loss,
              take_profit, status, opened_at, created_at
         FROM trades
        WHERE signal_id = $1
        ORDER BY opened_at DESC`,
      [signalId],
    );
    return result.rows;
  }

  async createMatch(data) {
    const result = await this.db.query(
      `INSERT INTO trade_matches (
         trade_id, signal_id, message_id, provider_id, user_id, match_strategy,
         match_confidence, matched_factors, status, instruction_type,
         instruction_payload, error, created_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
       RETURNING id, trade_id, signal_id, match_strategy, match_confidence, status, created_at`,
      [
        data.tradeId || null,
        data.signalId || null,
        data.messageId || null,
        data.providerId || null,
        data.userId || null,
        data.matchStrategy,
        data.matchConfidence ?? null,
        data.matchedFactors ? JSON.stringify(data.matchedFactors) : null,
        data.status,
        data.instructionType || null,
        data.instructionPayload ? JSON.stringify(data.instructionPayload) : null,
        data.error || null,
      ],
    );
    return result.rows[0];
  }

  async listMatchesByTrade(tradeId) {
    const result = await this.db.query(
      `SELECT id, trade_id, signal_id, message_id, match_strategy, match_confidence,
              status, instruction_type, created_at
         FROM trade_matches
        WHERE trade_id = $1
        ORDER BY created_at DESC`,
      [tradeId],
    );
    return result.rows;
  }

  async listMatchesBySignal(signalId) {
    const result = await this.db.query(
      `SELECT id, trade_id, signal_id, message_id, match_strategy, match_confidence,
              status, instruction_type, created_at
         FROM trade_matches
        WHERE signal_id = $1
        ORDER BY created_at DESC`,
      [signalId],
    );
    return result.rows;
  }
}

export default MatchingRepository;