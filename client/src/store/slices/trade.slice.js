/**
 * Trade Slice
 *
 * Manages open positions, pending orders, trade history, closed
 * trades, trade shadows, and the currently selected trade.
 *
 * @module client/src/store/slices/trade
 */

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  openPositions: [],
  pendingOrders: [],
  history: [],
  closedTrades: [],
  tradeShadows: [],
  selectedTrade: null,
  filters: {
    symbol: null,
    direction: null,
    status: null,
    accountId: null,
    from: null,
    to: null,
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
  },
  isLoading: false,
  isLoadingMore: false,
  error: null,
  lastUpdatedAt: null,
};

const tradeSlice = createSlice({
  name: 'trade',
  initialState,
  reducers: {
    tradesLoadRequest(state) {
      state.isLoading = true;
      state.error = null;
    },
    tradesLoadSuccess(state, action) {
      const payload = action.payload || {};
      state.isLoading = false;
      state.openPositions = Array.isArray(payload.openPositions) ? payload.openPositions : [];
      state.pendingOrders = Array.isArray(payload.pendingOrders) ? payload.pendingOrders : [];
      state.history = Array.isArray(payload.history) ? payload.history : [];
      state.pagination = payload.meta || state.pagination;
      state.error = null;
      state.lastUpdatedAt = new Date().toISOString();
    },
    tradesLoadFailed(state, action) {
      state.isLoading = false;
      state.error = action.payload || 'Failed to load trades';
    },
    tradeOpened(state, action) {
      state.openPositions = [action.payload, ...state.openPositions];
      state.lastUpdatedAt = new Date().toISOString();
    },
    tradeUpdated(state, action) {
      const updated = action.payload;
      state.openPositions = state.openPositions.map((t) =>
        t.tradeId === updated.tradeId ? { ...t, ...updated } : t,
      );
      if (state.selectedTrade && state.selectedTrade.tradeId === updated.tradeId) {
        state.selectedTrade = { ...state.selectedTrade, ...updated };
      }
    },
    tradeClosed(state, action) {
      const closed = action.payload;
      state.openPositions = state.openPositions.filter((t) => t.tradeId !== closed.tradeId);
      state.closedTrades = [closed, ...state.closedTrades];
      state.history = [closed, ...state.history];
      state.lastUpdatedAt = new Date().toISOString();
    },
    tradeSelected(state, action) {
      state.selectedTrade = action.payload;
    },
    tradeClearedSelection(state) {
      state.selectedTrade = null;
    },
    tradeShadowsLoaded(state, action) {
      state.tradeShadows = Array.isArray(action.payload) ? action.payload : [];
    },
    tradeFiltersUpdated(state, action) {
      state.filters = { ...state.filters, ...(action.payload || {}) };
    },
    tradeFiltersCleared(state) {
      state.filters = initialState.filters;
    },
    tradeReset() {
      return initialState;
    },
  },
});

export const {
  tradesLoadRequest,
  tradesLoadSuccess,
  tradesLoadFailed,
  tradeOpened,
  tradeUpdated,
  tradeClosed,
  tradeSelected,
  tradeClearedSelection,
  tradeShadowsLoaded,
  tradeFiltersUpdated,
  tradeFiltersCleared,
  tradeReset,
} = tradeSlice.actions;

export default tradeSlice.reducer;