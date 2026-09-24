/**
 * Signal Slice
 *
 * Manages signals across the pipeline: live, historical, parsed,
 * validated, duplicates, consensus, and rejected. Includes the
 * currently selected signal for details views.
 *
 * @module client/src/store/slices/signal
 */

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  liveSignals: [],
  history: [],
  selectedSignal: null,
  consensusSignals: [],
  duplicateSignals: [],
  rejectedSignals: [],
  filters: {
    symbol: null,
    direction: null,
    status: null,
    providerId: null,
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

const signalSlice = createSlice({
  name: 'signal',
  initialState,
  reducers: {
    signalsLoadRequest(state) {
      state.isLoading = true;
      state.error = null;
    },
    signalsLoadSuccess(state, action) {
      const payload = action.payload || {};
      state.isLoading = false;
      state.liveSignals = Array.isArray(payload.items) ? payload.items : [];
      state.pagination = payload.meta || state.pagination;
      state.error = null;
      state.lastUpdatedAt = new Date().toISOString();
    },
    signalsLoadFailed(state, action) {
      state.isLoading = false;
      state.error = action.payload || 'Failed to load signals';
    },
    signalReceived(state, action) {
      state.liveSignals = [action.payload, ...state.liveSignals];
      state.lastUpdatedAt = new Date().toISOString();
    },
    signalUpdated(state, action) {
      const updated = action.payload;
      state.liveSignals = state.liveSignals.map((s) =>
        s.signalId === updated.signalId ? { ...s, ...updated } : s,
      );
      if (state.selectedSignal && state.selectedSignal.signalId === updated.signalId) {
        state.selectedSignal = { ...state.selectedSignal, ...updated };
      }
    },
    signalRemoved(state, action) {
      state.liveSignals = state.liveSignals.filter((s) => s.signalId !== action.payload);
    },
    signalSelected(state, action) {
      state.selectedSignal = action.payload;
    },
    signalClearedSelection(state) {
      state.selectedSignal = null;
    },
    signalHistoryLoaded(state, action) {
      const payload = action.payload || {};
      state.history = Array.isArray(payload.items) ? payload.items : [];
      state.pagination = payload.meta || state.pagination;
    },
    consensusSignalsLoaded(state, action) {
      state.consensusSignals = Array.isArray(action.payload) ? action.payload : [];
    },
    duplicateSignalsLoaded(state, action) {
      state.duplicateSignals = Array.isArray(action.payload) ? action.payload : [];
    },
    rejectedSignalsLoaded(state, action) {
      state.rejectedSignals = Array.isArray(action.payload) ? action.payload : [];
    },
    signalFiltersUpdated(state, action) {
      state.filters = { ...state.filters, ...(action.payload || {}) };
    },
    signalFiltersCleared(state) {
      state.filters = initialState.filters;
    },
    signalReset() {
      return initialState;
    },
  },
});

export const {
  signalsLoadRequest,
  signalsLoadSuccess,
  signalsLoadFailed,
  signalReceived,
  signalUpdated,
  signalRemoved,
  signalSelected,
  signalClearedSelection,
  signalHistoryLoaded,
  consensusSignalsLoaded,
  duplicateSignalsLoaded,
  rejectedSignalsLoaded,
  signalFiltersUpdated,
  signalFiltersCleared,
  signalReset,
} = signalSlice.actions;

export default signalSlice.reducer;