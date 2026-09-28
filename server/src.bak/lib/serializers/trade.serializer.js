/**
 * Trade Serializer
 *
 * @module server/lib/serializers/trade.serializer
 */

export function serializeTrade(trade) {
  if (!trade) {
    return null;
  }

  return {
    tradeId: trade.id,
    userId: trade.user_id,
    brokerAccountId: trade.broker_account_id,
    signalId: trade.signal_id,
    providerId: trade.provider_id,
    symbol: trade.symbol,
    direction: trade.direction,
    volume: trade.volume,
    entryPrice: trade.entry_price,
    exitPrice: trade.exit_price,
    stopLoss: trade.stop_loss,
    takeProfit: trade.take_profit,
    status: trade.status,
    realizedProfit: trade.realized_profit,
    unrealizedProfit: trade.unrealized_profit,
    openedAt: trade.opened_at,
    closedAt: trade.closed_at,
  };
}

export default serializeTrade;