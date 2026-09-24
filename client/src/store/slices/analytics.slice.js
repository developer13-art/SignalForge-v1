/**
 * Analytics Slice
 *
 * Manages aggregated analytics data: equity curve, drawdown, win rate,
 * profit factor, symbol performance, execution latency, and calendar
 * heatmaps.
 *
 * @module client/src/store/slices/analytics
 */

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  equityCurve: [],
  drawdownSeries: [],
  winRate: null,
  profitFactor: null,
  averageRiskReward: null,
  sharpeRatio: null,
  sortinoRatio: null,
  symbolPerformance: [],
  executionLatency: [],
  riskBehavior: null,
  calendar: [],
  range: '30d',
  isLoading: false,
  error: null,
  lastUpdatedAt: null,
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    analyticsLoadRequest(state) {
      state.isLoading = true;
      state.error = null;
    },
    analyticsLoadSuccess(state, action) {
      const payload = action.payload || {};
      state.isLoading = false;
      state.equityCurve = payload.equityCurve || state.equityCurve;
      state.drawdownSeries = payload.drawdownSeries || state.drawdownSeries;
      state.winRate = payload.winRate ?? state.winRate;
      state.profitFactor = payload.profitFactor ?? state.profitFactor;
      state.averageRiskReward = payload.averageRiskReward ?? state.averageRiskReward;
      state.sharpeRatio = payload.sharpeRatio ?? state.sharpeRatio;
      state.sortinoRatio = payload.sortinoRatio ?? state.sortinoRatio;
      state.symbolPerformance = payload.symbolPerformance || state.symbolPerformance;
      state.executionLatency = payload.executionLatency || state.executionLatency;
      state.riskBehavior = payload.riskBehavior || state.riskBehavior;
      state.calendar = payload.calendar || state.calendar;
      state.error = null;
      state.lastUpdatedAt = new Date().toISOString();
    },
    analyticsLoadFailed(state, action) {
      state.isLoading = false;
      state.error = action.payload || 'Failed to load analytics';
    },
    analyticsRangeChanged(state, action) {
      state.range = action.payload;
    },
    analyticsReset() {
      return initialState;
    },
  },
});

export const {
  analyticsLoadRequest,
  analyticsLoadSuccess,
  analyticsLoadFailed,
  analyticsRangeChanged,
  analyticsReset,
} = analyticsSlice.actions;

export default analyticsSlice.reducer;