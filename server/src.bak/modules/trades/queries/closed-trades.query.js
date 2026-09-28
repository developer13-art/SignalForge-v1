/**
 * Closed Trades Query
 *
 * @module signalforge/server/modules/trades/queries/closed-trades
 */

import { TradeRepository } from '../trade.repository.js';

export class ClosedTradesQuery {
  constructor(repository = null) {
    this.repository = repository || new TradeRepository();
  }

  async execute(userId, filters = {}, pagination = {}) {
    const result = await this.repository.listClosedTrades(userId, filters, pagination);
    return {
      trades: result.trades.map((row) => this.serialize(row)),
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
      direction: row.direction,
      volume: row.volume,
      entryPrice: row.entry_price,
      exitPrice: row.exit_price,
      realizedProfit: row.realized_profit,
      commission: row.commission,
      swap: row.swap,
      status: row.status,
      openedAt: row.opened_at,
      closedAt: row.closed_at,
    };
  }
}

export default ClosedTradesQuery;