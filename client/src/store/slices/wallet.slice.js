/**
 * Wallet Slice
 *
 * Redux slice for wallet state: available balance, pending balance,
 * ledger entries, and withdrawal operations. All monetary changes
 * come from the backend ledger.
 *
 * @module client/src/store/slices/wallet.slice
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { walletApi } from '../../api/wallet.api.js';

export const fetchWalletOverview = createAsyncThunk(
  'wallet/fetchOverview',
  async (_, { rejectWithValue }) => {
    try {
      const response = await walletApi.getOverview();
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || { message: err.message });
    }
  },
);

export const fetchWalletLedger = createAsyncThunk(
  'wallet/fetchLedger',
  async (params, { rejectWithValue }) => {
    try {
      const response = await walletApi.listLedger(params);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || { message: err.message });
    }
  },
);

export const createWithdrawal = createAsyncThunk(
  'wallet/createWithdrawal',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await walletApi.createWithdrawal(payload);
      return response.data.data.withdrawal;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || { message: err.message });
    }
  },
);

export const fetchWithdrawals = createAsyncThunk(
  'wallet/fetchWithdrawals',
  async (params, { rejectWithValue }) => {
    try {
      const response = await walletApi.listWithdrawals(params);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || { message: err.message });
    }
  },
);

const initialState = {
  overview: {
    availableBalance: 0,
    pendingBalance: 0,
    lifetimeEarned: 0,
    lifetimeWithdrawn: 0,
    currency: 'USD',
  },
  ledger: [],
  ledgerMeta: null,
  withdrawals: [],
  withdrawalsMeta: null,
  loading: false,
  ledgerLoading: false,
  withdrawalLoading: false,
  error: null,
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setOverview(state, action) {
      state.overview = { ...state.overview, ...action.payload };
    },
    addLedgerEntry(state, action) {
      state.ledger = [action.payload, ...state.ledger];
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWalletOverview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWalletOverview.fulfilled, (state, action) => {
        state.loading = false;
        state.overview = { ...state.overview, ...action.payload };
      })
      .addCase(fetchWalletOverview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Failed to load wallet' };
      })
      .addCase(fetchWalletLedger.pending, (state) => {
        state.ledgerLoading = true;
      })
      .addCase(fetchWalletLedger.fulfilled, (state, action) => {
        state.ledgerLoading = false;
        state.ledger = action.payload?.items || [];
        state.ledgerMeta = action.payload?.meta || null;
      })
      .addCase(fetchWalletLedger.rejected, (state, action) => {
        state.ledgerLoading = false;
        state.error = action.payload || { message: 'Failed to load ledger' };
      })
      .addCase(createWithdrawal.pending, (state) => {
        state.withdrawalLoading = true;
        state.error = null;
      })
      .addCase(createWithdrawal.fulfilled, (state, action) => {
        state.withdrawalLoading = false;
        state.withdrawals = [action.payload, ...state.withdrawals];
      })
      .addCase(createWithdrawal.rejected, (state, action) => {
        state.withdrawalLoading = false;
        state.error = action.payload || { message: 'Failed to create withdrawal' };
      })
      .addCase(fetchWithdrawals.fulfilled, (state, action) => {
        state.withdrawals = action.payload?.items || [];
        state.withdrawalsMeta = action.payload?.meta || null;
      });
  },
});

export const {
  setOverview,
  addLedgerEntry,
  clearError,
} = walletSlice.actions;

export const selectWalletOverview = (state) => state.wallet.overview;
export const selectWalletLedger = (state) => state.wallet.ledger;
export const selectWithdrawals = (state) => state.wallet.withdrawals;
export const selectWalletLoading = (state) => state.wallet.loading;

export default walletSlice.reducer;