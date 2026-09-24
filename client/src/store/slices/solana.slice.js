/**
 * Solana Slice
 *
 * Redux slice for Solana state: connected wallets, attestations,
 * provenance records, payments, and transaction status.
 *
 * @module client/src/store/slices/solana.slice
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { solanaApi } from '../../api/solana.api.js';

export const fetchWallets = createAsyncThunk(
  'solana/fetchWallets',
  async (_, { rejectWithValue }) => {
    try {
      const response = await solanaApi.listWallets();
      return response.data.data.wallets;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || { message: err.message });
    }
  },
);

export const fetchAttestations = createAsyncThunk(
  'solana/fetchAttestations',
  async (params, { rejectWithValue }) => {
    try {
      const response = await solanaApi.listAttestations(params);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || { message: err.message });
    }
  },
);

export const fetchProvenance = createAsyncThunk(
  'solana/fetchProvenance',
  async (params, { rejectWithValue }) => {
    try {
      const response = await solanaApi.listProvenance(params);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || { message: err.message });
    }
  },
);

export const fetchSolanaPayments = createAsyncThunk(
  'solana/fetchPayments',
  async (params, { rejectWithValue }) => {
    try {
      const response = await solanaApi.listPayments(params);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || { message: err.message });
    }
  },
);

export const createSolanaPayment = createAsyncThunk(
  'solana/createPayment',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await solanaApi.createPayment(payload);
      return response.data.data.payment;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || { message: err.message });
    }
  },
);

const initialState = {
  wallets: [],
  primaryWallet: null,
  attestations: [],
  attestationsMeta: null,
  provenance: [],
  provenanceMeta: null,
  payments: [],
  paymentsMeta: null,
  currentPayment: null,
  connectionStatus: 'disconnected',
  network: 'devnet',
  loading: false,
  error: null,
};

const solanaSlice = createSlice({
  name: 'solana',
  initialState,
  reducers: {
    setWallets(state, action) {
      state.wallets = action.payload || [];
      state.primaryWallet = state.wallets.find((w) => w.isPrimary) || null;
    },
    setConnectionStatus(state, action) {
      state.connectionStatus = action.payload;
    },
    addAttestation(state, action) {
      state.attestations = [action.payload, ...state.attestations];
    },
    setCurrentPayment(state, action) {
      state.currentPayment = action.payload || null;
    },
    clearCurrentPayment(state) {
      state.currentPayment = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWallets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWallets.fulfilled, (state, action) => {
        state.loading = false;
        state.wallets = action.payload || [];
        state.primaryWallet = state.wallets.find((w) => w.isPrimary) || null;
      })
      .addCase(fetchWallets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Failed to load wallets' };
      })
      .addCase(fetchAttestations.fulfilled, (state, action) => {
        state.attestations = action.payload?.items || [];
        state.attestationsMeta = action.payload?.meta || null;
      })
      .addCase(fetchProvenance.fulfilled, (state, action) => {
        state.provenance = action.payload?.items || [];
        state.provenanceMeta = action.payload?.meta || null;
      })
      .addCase(fetchSolanaPayments.fulfilled, (state, action) => {
        state.payments = action.payload?.items || [];
        state.paymentsMeta = action.payload?.meta || null;
      })
      .addCase(createSolanaPayment.fulfilled, (state, action) => {
        state.currentPayment = action.payload || null;
      });
  },
});

export const {
  setWallets,
  setConnectionStatus,
  addAttestation,
  setCurrentPayment,
  clearCurrentPayment,
  clearError,
} = solanaSlice.actions;

export const selectSolanaWallets = (state) => state.solana.wallets;
export const selectPrimaryWallet = (state) => state.solana.primaryWallet;
export const selectAttestations = (state) => state.solana.attestations;
export const selectProvenance = (state) => state.solana.provenance;
export const selectSolanaPayments = (state) => state.solana.payments;
export const selectCurrentSolanaPayment = (state) => state.solana.currentPayment;
export const selectSolanaConnectionStatus = (state) => state.solana.connectionStatus;

export default solanaSlice.reducer; 