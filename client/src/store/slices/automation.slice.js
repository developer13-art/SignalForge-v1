/**
 * Automation Slice
 *
 * Manages IF/THEN automation rules, rule testing state, and rule
 * execution history.
 *
 * @module client/src/store/slices/automation
 */

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  rules: [],
  selectedRule: null,
  testResult: null,
  executionHistory: [],
  isLoading: false,
  isSaving: false,
  isTesting: false,
  error: null,
};

const automationSlice = createSlice({
  name: 'automation',
  initialState,
  reducers: {
    rulesLoadRequest(state) {
      state.isLoading = true;
      state.error = null;
    },
    rulesLoadSuccess(state, action) {
      state.isLoading = false;
      state.rules = Array.isArray(action.payload) ? action.payload : [];
      state.error = null;
    },
    rulesLoadFailed(state, action) {
      state.isLoading = false;
      state.error = action.payload || 'Failed to load rules';
    },
    ruleCreateSuccess(state, action) {
      state.rules = [...state.rules, action.payload];
    },
    ruleUpdateSuccess(state, action) {
      const updated = action.payload;
      state.rules = state.rules.map((r) => (r.ruleId === updated.ruleId ? updated : r));
      if (state.selectedRule && state.selectedRule.ruleId === updated.ruleId) {
        state.selectedRule = updated;
      }
    },
    ruleDeleteSuccess(state, action) {
      state.rules = state.rules.filter((r) => r.ruleId !== action.payload);
      if (state.selectedRule && state.selectedRule.ruleId === action.payload) {
        state.selectedRule = null;
      }
    },
    ruleToggled(state, action) {
      const { ruleId, enabled } = action.payload || {};
      state.rules = state.rules.map((r) => (r.ruleId === ruleId ? { ...r, enabled } : r));
    },
    ruleSelected(state, action) {
      state.selectedRule = action.payload;
    },
    ruleClearedSelection(state) {
      state.selectedRule = null;
    },
    ruleSaveRequest(state) {
      state.isSaving = true;
      state.error = null;
    },
    ruleSaveFailed(state, action) {
      state.isSaving = false;
      state.error = action.payload || 'Failed to save rule';
    },
    ruleTestRequest(state) {
      state.isTesting = true;
      state.testResult = null;
    },
    ruleTestSuccess(state, action) {
      state.isTesting = false;
      state.testResult = action.payload || null;
    },
    ruleTestFailed(state, action) {
      state.isTesting = false;
      state.error = action.payload || 'Failed to test rule';
    },
    ruleExecutionHistoryLoaded(state, action) {
      state.executionHistory = Array.isArray(action.payload) ? action.payload : [];
    },
    automationReset() {
      return initialState;
    },
  },
});

export const {
  rulesLoadRequest,
  rulesLoadSuccess,
  rulesLoadFailed,
  ruleCreateSuccess,
  ruleUpdateSuccess,
  ruleDeleteSuccess,
  ruleToggled,
  ruleSelected,
  ruleClearedSelection,
  ruleSaveRequest,
  ruleSaveFailed,
  ruleTestRequest,
  ruleTestSuccess,
  ruleTestFailed,
  ruleExecutionHistoryLoaded,
  automationReset,
} = automationSlice.actions;

export default automationSlice.reducer;