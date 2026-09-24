/**
 * Broker Slice
 *
 * Manages connected broker accounts, connection status, balance and
 * equity snapshots, and connection logs.
 *
 * @module client/src/store/slices/broker
 */

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  accounts: [],
  selectedAccount: null,
  connectionLogs: [],
  isLoading: false,
  isConnecting: false,
  isSyncing: false,
  error: null,
  lastSyncedAt: null,
};

const brokerSlice = createSlice({
  name: 'broker',
  initialState,
  reducers: {
    brokersLoadRequest(state) {
      state.isLoading = true;
      state.error = null;
    },
    brokersLoadSuccess(state, action) {
      state.isLoading = false;
      state.accounts = Array.isArray(action.payload) ? action.payload : [];
      state.error = null;
    },
    brokersLoadFailed(state, action) {
      state.isLoading = false;
      state.error = action.payload || 'Failed to load broker accounts';
    },
    brokerConnectRequest(state) {
      state.isConnecting = true;
      state.error = null;
    },
    brokerConnectSuccess(state, action) {
      state.isConnecting = false;
      state.accounts = [...state.accounts, action.payload];
      state.error = null;
    },
    brokerConnectFailed(state, action) {
      state.isConnecting = false;
      state.error = action.payload || 'Failed to connect broker';
    },
    brokerUpdated(state, action) {
      const updated = action.payload;
      state.accounts = state.accounts.map((a) =>
        a.brokerAccountId === updated.brokerAccountId ? { ...a, ...updated } : a,
      );
      if (state.selectedAccount && state.selectedAccount.brokerAccountId === updated.brokerAccountId) {
        state.selectedAccount = { ...state.selectedAccount, ...updated };
      }
    },
    brokerDisconnected(state, action) {
      state.accounts = state.accounts.map((a) =>
        a.brokerAccountId === action.payload
          ? { ...a, connectionStatus: 'DISCONNECTED' }
          : a,
      );
    },
    brokerRemoved(state, action) {
      state.accounts = state.accounts.filter((a) => a.brokerAccountId !== action.payload);
      if (state.selectedAccount && state.selectedAccount.brokerAccountId === action.payload) {
        state.selectedAccount = null;
      }
    },
    brokerSelected(state, action) {
      state.selectedAccount = action.payload;
    },
    brokerClearedSelection(state) {
      state.selectedAccount = null;
    },
    brokerSyncRequest(state) {
      state.isSyncing = true;
    },
    brokerSyncSuccess(state) {
      state.isSyncing = false;
      state.lastSyncedAt = new Date().toISOString();
    },
    brokerSyncFailed(state, action) {
      state.isSyncing = false;
      state.error = action.payload || 'Failed to sync account';
    },
    brokerConnectionLogsLoaded(state, action) {
      state.connectionLogs = Array.isArray(action.payload) ? action.payload : [];
    },
    brokerReset() {
      return initialState;
    },
  },
});

export const {
  brokersLoadRequest,
  brokersLoadSuccess,
  brokersLoadFailed,
  brokerConnectRequest,
  brokerConnectSuccess,
  brokerConnectFailed,
  brokerUpdated,
  brokerDisconnected,
  brokerRemoved,
  brokerSelected,
  brokerClearedSelection,
  brokerSyncRequest,
  brokerSyncSuccess,
  brokerSyncFailed,
  brokerConnectionLogsLoaded,
  brokerReset,
} = brokerSlice.actions;

export default brokerSlice.reducer;