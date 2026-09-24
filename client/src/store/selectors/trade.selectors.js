/**
 * Trade Selectors
 *
 * @module client/src/store/selectors/trade.selectors
 */

export const selectTradeState = (state) => state.trade;

export const selectTrades = (state) => state.trade.trades;

export const selectOpenPositions = (state) =>
  (state.trade.trades || []).filter((t) =>
    ['OPEN', 'BREAK_EVEN', 'TRAILING_STOP', 'PARTIAL_CLOSE'].includes(t.status),
  );

export const selectPendingOrders = (state) =>
  (state.trade.trades || []).filter((t) => t.status === 'PENDING_ORDER');

export const selectClosedTrades = (state) =>
  (state.trade.trades || []).filter((t) => ['CLOSED', 'ARCHIVED'].includes(t.status));

export const selectCurrentTrade = (state) => state.trade.currentTrade;

export const selectTradeEvents = (state) => state.trade.events;

export const selectTradeShadow = (state) => state.trade.shadow;

export const selectTradeFilters = (state) => state.trade.filters;

export const selectTradePagination = (state) => state.trade.pagination;

export const selectTradesLoading = (state) => state.trade.loading;

export const selectTradesError = (state) => state.trade.error;

export const selectTotalRealizedProfit = (state) =>
  (state.trade.trades || [])
    .filter((t) => ['CLOSED', 'ARCHIVED'].includes(t.status))
    .reduce((sum, t) => sum + (Number(t.realizedProfit) || 0), 0);

export const selectUnrealizedProfit = (state) =>
  (state.trade.trades || [])
    .filter((t) => ['OPEN', 'BREAK_EVEN', 'TRAILING_STOP', 'PARTIAL_CLOSE'].includes(t.status))
    .reduce((sum, t) => sum + (Number(t.unrealizedProfit) || 0), 0);