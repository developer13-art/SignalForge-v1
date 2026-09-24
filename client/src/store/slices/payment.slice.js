/**
 * Payment Slice
 *
 * Redux slice for payment state: methods, intents, receipts, and
 * invoices. All payment confirmation happens through backend
 * webhooks, so this slice only reflects the client view.
 *
 * @module client/src/store/slices/payment.slice
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { paymentApi } from '../../api/payment.api.js';

export const fetchPaymentMethods = createAsyncThunk(
  'payment/fetchMethods',
  async (_, { rejectWithValue }) => {
    try {
      const response = await paymentApi.listMethods();
      return response.data.data.methods;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || { message: err.message });
    }
  },
);

export const fetchPaymentHistory = createAsyncThunk(
  'payment/fetchHistory',
  async (params, { rejectWithValue }) => {
    try {
      const response = await paymentApi.listPayments(params);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || { message: err.message });
    }
  },
);

export const createPaymentIntent = createAsyncThunk(
  'payment/createIntent',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await paymentApi.createIntent(payload);
      return response.data.data.intent;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || { message: err.message });
    }
  },
);

export const fetchInvoices = createAsyncThunk(
  'payment/fetchInvoices',
  async (params, { rejectWithValue }) => {
    try {
      const response = await paymentApi.listInvoices(params);
      return response.data.data.invoices;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || { message: err.message });
    }
  },
);

const initialState = {
  methods: [],
  payments: [],
  paymentsMeta: null,
  currentIntent: null,
  invoices: [],
  loading: false,
  historyLoading: false,
  intentLoading: false,
  error: null,
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    setMethods(state, action) {
      state.methods = action.payload || [];
    },
    setCurrentIntent(state, action) {
      state.currentIntent = action.payload || null;
    },
    clearCurrentIntent(state) {
      state.currentIntent = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPaymentMethods.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaymentMethods.fulfilled, (state, action) => {
        state.loading = false;
        state.methods = action.payload || [];
      })
      .addCase(fetchPaymentMethods.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Failed to load payment methods' };
      })
      .addCase(fetchPaymentHistory.pending, (state) => {
        state.historyLoading = true;
      })
      .addCase(fetchPaymentHistory.fulfilled, (state, action) => {
        state.historyLoading = false;
        state.payments = action.payload?.items || [];
        state.paymentsMeta = action.payload?.meta || null;
      })
      .addCase(fetchPaymentHistory.rejected, (state, action) => {
        state.historyLoading = false;
        state.error = action.payload || { message: 'Failed to load payment history' };
      })
      .addCase(createPaymentIntent.pending, (state) => {
        state.intentLoading = true;
        state.error = null;
      })
      .addCase(createPaymentIntent.fulfilled, (state, action) => {
        state.intentLoading = false;
        state.currentIntent = action.payload || null;
      })
      .addCase(createPaymentIntent.rejected, (state, action) => {
        state.intentLoading = false;
        state.error = action.payload || { message: 'Failed to create payment intent' };
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.invoices = action.payload || [];
      });
  },
});

export const {
  setMethods,
  setCurrentIntent,
  clearCurrentIntent,
  clearError,
} = paymentSlice.actions;

export const selectPaymentMethods = (state) => state.payment.methods;
export const selectPaymentHistory = (state) => state.payment.payments;
export const selectPaymentHistoryMeta = (state) => state.payment.paymentsMeta;
export const selectCurrentIntent = (state) => state.payment.currentIntent;
export const selectInvoices = (state) => state.payment.invoices;
export const selectPaymentLoading = (state) => state.payment.loading;

export default paymentSlice.reducer;