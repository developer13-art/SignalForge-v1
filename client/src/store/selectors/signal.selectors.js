/**
 * Signal Selectors
 *
 * @module client/src/store/selectors/signal.selectors
 */

export const selectSignalState = (state) => state.signal;

export const selectSignals = (state) => state.signal.signals;

export const selectLiveSignals = (state) =>
  (state.signal.signals || []).filter((s) =>
    ['RECEIVED', 'CLASSIFIED', 'PARSED', 'VALIDATED', 'FANOUT_PENDING', 'EXECUTION_PENDING'].includes(s.status),
  );

export const selectSignalHistory = (state) =>
  (state.signal.signals || []).filter((s) =>
    ['EXECUTED', 'RISK_REJECTED', 'VALIDATION_FAILED', 'DUPLICATE', 'ARCHIVED'].includes(s.status),
  );

export const selectCurrentSignal = (state) => state.signal.currentSignal;

export const selectSignalTimeline = (state) => state.signal.timeline;

export const selectSignalEvents = (state) => state.signal.events;

export const selectConsensusSignals = (state) => state.signal.consensus;

export const selectDuplicateSignals = (state) => state.signal.duplicates;

export const selectRejectedSignals = (state) => state.signal.rejected;

export const selectSignalFilters = (state) => state.signal.filters;

export const selectSignalPagination = (state) => state.signal.pagination;

export const selectSignalsLoading = (state) => state.signal.loading;

export const selectSignalsError = (state) => state.signal.error;

export const selectSignalById = (signalId) => (state) =>
  (state.signal.signals || []).find((s) => s.signalId === signalId);

export const selectHighConfidenceSignals = (state) =>
  (state.signal.signals || []).filter((s) => Number(s.confidence) >= 0.8);