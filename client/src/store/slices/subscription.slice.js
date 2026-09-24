/**
 * Subscription Slice
 *
 * Redux slice for subscription state: current plan, status, period,
 * usage counters, and upgrade/downgrade history. Server state is
 * also mirrored via React Query; this slice holds the pieces the
 * client needs synchronously (badges, guards, banners).
 *
 * @module client/src/store/slices/subscription.slice
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { subscriptionApi } from '../../api/subscription.api.js';

export const fetchSubscription = createAsyncThunk(
  'subscription/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await subscriptionApi.getCurrent();
      return response.data.data.subscription;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || { message: err.message });
    }
  },
);

export const fetchPlans = createAsyncThunk(
  'subscription/fetchPlans',
  async (_, { rejectWithValue }) => {
    try {
      const response = await subscriptionApi.listPlans();
      return response.data.data.plans;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || { message: err.message });
    }
  },
);

export const cancelSubscription = createAsyncThunk(
  'subscription/cancel',
  async ({ reason }, { rejectWithValue }) => {
    try {
      const response = await subscriptionApi.cancel({ reason });
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || { message: err.message });
    }
  },
);

const initialState = {
  subscription: null,
  plans: [],
  history: [],
  usage: null,
  loading: false,
  plansLoading: false,
  error: null,
  lastFetchedAt: null,
};

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    setSubscription(state, action) {
      state.subscription = action.payload;
      state.lastFetchedAt = Date.now();
    },
    clearSubscription(state) {
      state.subscription = null;
      state.usage = null;
      state.history = [];
      state.lastFetchedAt = null;
    },
    setUsage(state, action) {
      state.usage = action.payload;
    },
    setHistory(state, action) {
      state.history = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.subscription = action.payload || null;
        state.usage = action.payload?.usage || null;
        state.lastFetchedAt = Date.now();
      })
      .addCase(fetchSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Failed to fetch subscription' };
      })
      .addCase(fetchPlans.pending, (state) => {
        state.plansLoading = true;
      })
      .addCase(fetchPlans.fulfilled, (state, action) => {
        state.plansLoading = false;
        state.plans = action.payload || [];
      })
      .addCase(fetchPlans.rejected, (state, action) => {
        state.plansLoading = false;
        state.error = action.payload || { message: 'Failed to fetch plans' };
      })
      .addCase(cancelSubscription.fulfilled, (state, action) => {
        if (state.subscription) {
          state.subscription.status = action.payload?.status || 'CANCELLED';
          state.subscription.cancelledAt = action.payload?.cancelledAt || new Date().toISOString();
        }
      })
      .addCase(cancelSubscription.rejected, (state, action) => {
        state.error = action.payload || { message: 'Failed to cancel subscription' };
      });
  },
});

export const {
  setSubscription,
  clearSubscription,
  setUsage,
  setHistory,
  clearError,
} = subscriptionSlice.actions;

export const selectSubscription = (state) => state.subscription.subscription;
export const selectSubscriptionPlans = (state) => state.subscription.plans;
export const selectSubscriptionUsage = (state) => state.subscription.usage;
export const selectSubscriptionLoading = (state) => state.subscription.loading;
export const selectSubscriptionError = (state) => state.subscription.error;

export default subscriptionSlice.reducer;