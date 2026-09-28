/**
 * Open Positions Query
 *
 * @module signalforge/server/modules/trades/queries/open-positions
 */

import { TradeRepository } from '../trade.repository.js';

export class OpenPositionsQuery {
  constructor(repository = null) {
    this.repository = repository || new TradeRepository();
  }

  async execute(userId, filters = {}, pagination = {}) {
    const result = await this.repository.listOpenPositions(userId, filters, pagination);
    return {
      positions: result.trades.map((row) => this.serialize(row)),
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    };
  }

  serialize(row) {
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      tradeId: row.trade_id,
      symbol: row.symbol,
      normalizedSymbol: row.normalized_symbol,
      direction: row.direction,
      volume: row.volume,
      remainingVolume: row.remaining_volume,
      entryPrice: row.entry_price,
      stopLoss: row.stop_loss,
      takeProfit: row.take_profit,
      status: row.status,
      unrealizedProfit: row.unrealized_profit,
      openedAt: row.opened_at,
      createdAt: row.created_at,
    };
  }
}

export default OpenPositionsQuery;