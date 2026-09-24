/**
 * Risk Slice
 *
 * Manages the user's risk profile, active risk events, and the
 * emergency stop state. The risk profile drives server-side risk
 * decisions on every signal.
 *
 * @module client/src/store/slices/risk
 */

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  profile: {
    riskPercent: 1,
    maxDailyLoss: null,
    maxDrawdown: null,
    maxOpenTrades: 10,
    tradingSessions: [],
    trailingStopEnabled: false,
    breakEvenEnabled: false,
    profitLockEnabled: false,
    partialCloseEnabled: false,
    correlationProtectionEnabled: false,
    newsFilterEnabled: false,
    emergencyStopEnabled: false,
  },
  riskEvents: [],
  checks: [],
  emergencyStopActive: false,
  isLoading: false,
  isSaving: false,
  error: null,
};

const riskSlice = createSlice({
  name: 'risk',
  initialState,
  reducers: {
    riskProfileLoadRequest(state) {
      state.isLoading = true;
      state.error = null;
    },
    riskProfileLoadSuccess(state, action) {
      state.isLoading = false;
      state.profile = { ...state.profile, ...(action.payload || {}) };
      state.error = null;
    },
    riskProfileLoadFailed(state, action) {
      state.isLoading = false;
      state.error = action.payload || 'Failed to load risk profile';
    },
    riskProfileSaveRequest(state) {
      state.isSaving = true;
      state.error = null;
    },
    riskProfileSaveSuccess(state, action) {
      state.isSaving = false;
      state.profile = { ...state.profile, ...(action.payload || {}) };
      state.error = null;
    },
    riskProfileSaveFailed(state, action) {
      state.isSaving = false;
      state.error = action.payload || 'Failed to save risk profile';
    },
    riskProfileUpdated(state, action) {
      state.profile = { ...state.profile, ...(action.payload || {}) };
    },
    riskChecksLoaded(state, action) {
      state.checks = Array.isArray(action.payload) ? action.payload : [];
    },
    riskEventReceived(state, action) {
      state.riskEvents = [action.payload, ...state.riskEvents].slice(0, 100);
    },
    riskEventsLoaded(state, action) {
      state.riskEvents = Array.isArray(action.payload) ? action.payload : [];
    },
    emergencyStopTriggered(state) {
      state.emergencyStopActive = true;
      state.profile.emergencyStopEnabled = true;
    },
    emergencyStopCleared(state) {
      state.emergencyStopActive = false;
    },
    riskReset() {
      return initialState;
    },
  },
});

export const {
  riskProfileLoadRequest,
  riskProfileLoadSuccess,
  riskProfileLoadFailed,
  riskProfileSaveRequest,
  riskProfileSaveSuccess,
  riskProfileSaveFailed,
  riskProfileUpdated,
  riskChecksLoaded,
  riskEventReceived,
  riskEventsLoaded,
  emergencyStopTriggered,
  emergencyStopCleared,
  riskReset,
} = riskSlice.actions;

export default riskSlice.reducer;