/**
 * Pending Orders Query
 *
 * @module signalforge/server/modules/trades/queries/pending-orders
 */
const { TradeRepository } = require('../trade.repository.js');
class PendingOrdersQuery {
  constructor(repository = null) {
    this.repository = repository || new TradeRepository();
  }

  async execute(userId, filters = {}, pagination = {}) {
    const result = await this.repository.listPendingOrders(userId, filters, pagination);
    return {
      orders: result.trades.map((row) => this.serialize(row)),
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
      entryType: row.entry_type,
      requestedPrice: row.requested_price,
      volume: row.volume,
      stopLoss: row.stop_loss,
      takeProfit: row.take_profit,
      status: row.status,
      createdAt: row.created_at,
    };
  }
}
module.exports = PendingOrdersQuery;
module.exports.PendingOrdersQuery = PendingOrdersQuery;
