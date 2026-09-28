/**
 * Trade History Query
 *
 * @module signalforge/server/modules/trades/queries/trade-history
 */
const { TradeRepository } = require('../trade.repository.js');
const { DEFAULT_HISTORY_DAYS } = require('../trade.constants.js');

export class TradeHistoryQuery {
  constructor(repository = null) {
    this.repository = repository || new TradeRepository();
  }

  async execute(userId, filters = {}, pagination = {}) {
    const since =
      filters.since ||
      new Date(Date.now() - DEFAULT_HISTORY_DAYS * 24 * 60 * 60 * 1000).toISOString();

    const result = await this.repository.listTrades(
      {
        ...filters,
        userId,
        since,
      },
      pagination,
    );

    return {
      trades: result.trades.map((row) => this.serialize(row)),
      total: result.total,
      limit: result.limit,
      offset: result.offset,
      since,
    };
  }

  async summarize(userId, filters = {}) {
    const summary = await this.repository.sumRealizedProfit(userId, filters);
    return {
      ...summary,
      since: filters.since || null,
      until: filters.until || null,
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
      entryPrice: row.entry_price,
      exitPrice: row.exit_price,
      volume: row.volume,
      realizedProfit: row.realized_profit,
      status: row.status,
      openedAt: row.opened_at,
      closedAt: row.closed_at,
    };
  }
}
module.exports = TradeHistoryQuery;