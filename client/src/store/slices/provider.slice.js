/**
 * Provider Slice
 *
 * Redux slice for provider state: profile, subscribers, revenue,
 * certification status, and DNA highlights. Used by both the
 * Provider Business console and provider profiles.
 *
 * @module client/src/store/slices/provider.slice
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { providerApi } from '../../api/provider.api.js';

export const fetchProviderProfile = createAsyncThunk(
  'provider/fetchProfile',
  async (params, { rejectWithValue }) => {
    try {
      const response = await providerApi.getProfile(params);
      return response.data.data.provider;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || { message: err.message });
    }
  },
);

export const fetchProviderDashboard = createAsyncThunk(
  'provider/fetchDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await providerApi.getDashboard();
      return response.data.data.dashboard;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || { message: err.message });
    }
  },
);

export const fetchProviderSubscribers = createAsyncThunk(
  'provider/fetchSubscribers',
  async (params, { rejectWithValue }) => {
    try {
      const response = await providerApi.listSubscribers(params);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || { message: err.message });
    }
  },
);

export const fetchProviderRevenue = createAsyncThunk(
  'provider/fetchRevenue',
  async (params, { rejectWithValue }) => {
    try {
      const response = await providerApi.getRevenue(params);
      return response.data.data.revenue;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || { message: err.message });
    }
  },
);

export const fetchProviderCertification = createAsyncThunk(
  'provider/fetchCertification',
  async (_, { rejectWithValue }) => {
    try {
      const response = await providerApi.getCertification();
      return response.data.data.certification;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || { message: err.message });
    }
  },
);

const initialState = {
  profile: null,
  dashboard: null,
  subscribers: [],
  subscribersMeta: null,
  revenue: null,
  certification: null,
  loading: false,
  error: null,
};

const providerSlice = createSlice({
  name: 'provider',
  initialState,
  reducers: {
    setProfile(state, action) {
      state.profile = action.payload;
    },
    clearProvider(state) {
      state.profile = null;
      state.dashboard = null;
      state.subscribers = [];
      state.revenue = null;
      state.certification = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProviderProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProviderProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload || null;
      })
      .addCase(fetchProviderProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Failed to load provider profile' };
      })
      .addCase(fetchProviderDashboard.fulfilled, (state, action) => {
        state.dashboard = action.payload || null;
      })
      .addCase(fetchProviderSubscribers.fulfilled, (state, action) => {
        state.subscribers = action.payload?.items || [];
        state.subscribersMeta = action.payload?.meta || null;
      })
      .addCase(fetchProviderRevenue.fulfilled, (state, action) => {
        state.revenue = action.payload || null;
      })
      .addCase(fetchProviderCertification.fulfilled, (state, action) => {
        state.certification = action.payload || null;
      });
  },
});

export const { setProfile, clearProvider, clearError } = providerSlice.actions;

export const selectProviderProfile = (state) => state.provider.profile;
export const selectProviderDashboard = (state) => state.provider.dashboard;
export const selectProviderSubscribers = (state) => state.provider.subscribers;
export const selectProviderRevenue = (state) => state.provider.revenue;
export const selectProviderCertification = (state) => state.provider.certification;

export default providerSlice.reducer;