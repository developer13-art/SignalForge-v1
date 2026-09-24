/**
 * Marketplace Slice
 *
 * Redux slice for marketplace state: providers, traders, filters,
 * reviews, and comparison selections.
 *
 * @module client/src/store/slices/marketplace.slice
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { marketplaceApi } from '../../api/marketplace.api.js';

export const fetchMarketplaceProviders = createAsyncThunk(
  'marketplace/fetchProviders',
  async (params, { rejectWithValue }) => {
    try {
      const response = await marketplaceApi.listProviders(params);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || { message: err.message });
    }
  },
);

export const fetchMarketplaceTraders = createAsyncThunk(
  'marketplace/fetchTraders',
  async (params, { rejectWithValue }) => {
    try {
      const response = await marketplaceApi.listTraders(params);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || { message: err.message });
    }
  },
);

export const fetchTraderProfile = createAsyncThunk(
  'marketplace/fetchTraderProfile',
  async ({ traderId }, { rejectWithValue }) => {
    try {
      const response = await marketplaceApi.getTrader({ traderId });
      return response.data.data.trader;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || { message: err.message });
    }
  },
);

export const fetchProviderProfile = createAsyncThunk(
  'marketplace/fetchProviderProfile',
  async ({ providerId }, { rejectWithValue }) => {
    try {
      const response = await marketplaceApi.getProvider({ providerId });
      return response.data.data.provider;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || { message: err.message });
    }
  },
);

const initialState = {
  providers: [],
  providersMeta: null,
  traders: [],
  tradersMeta: null,
  currentProvider: null,
  currentTrader: null,
  comparison: [],
  filters: {
    search: '',
    categories: [],
    minWinRate: null,
    minMonthlyReturn: null,
    maxDrawdown: null,
    riskLevel: null,
    sortBy: 'aiScore',
    view: 'grid',
  },
  loading: false,
  error: null,
};

const marketplaceSlice = createSlice({
  name: 'marketplace',
  initialState,
  reducers: {
    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters(state) {
      state.filters = initialState.filters;
    },
    addToComparison(state, action) {
      if (state.comparison.length >= 3) {
        return;
      }
      if (!state.comparison.find((p) => p.id === action.payload.id)) {
        state.comparison.push(action.payload);
      }
    },
    removeFromComparison(state, action) {
      state.comparison = state.comparison.filter((p) => p.id !== action.payload);
    },
    clearComparison(state) {
      state.comparison = [];
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMarketplaceProviders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMarketplaceProviders.fulfilled, (state, action) => {
        state.loading = false;
        state.providers = action.payload?.items || [];
        state.providersMeta = action.payload?.meta || null;
      })
      .addCase(fetchMarketplaceProviders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Failed to load providers' };
      })
      .addCase(fetchMarketplaceTraders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMarketplaceTraders.fulfilled, (state, action) => {
        state.loading = false;
        state.traders = action.payload?.items || [];
        state.tradersMeta = action.payload?.meta || null;
      })
      .addCase(fetchMarketplaceTraders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Failed to load traders' };
      })
      .addCase(fetchTraderProfile.fulfilled, (state, action) => {
        state.currentTrader = action.payload || null;
      })
      .addCase(fetchProviderProfile.fulfilled, (state, action) => {
        state.currentProvider = action.payload || null;
      });
  },
});

export const {
  setFilters,
  resetFilters,
  addToComparison,
  removeFromComparison,
  clearComparison,
  clearError,
} = marketplaceSlice.actions;

export const selectMarketplaceProviders = (state) => state.marketplace.providers;
export const selectMarketplaceProvidersMeta = (state) => state.marketplace.providersMeta;
export const selectMarketplaceTraders = (state) => state.marketplace.traders;
export const selectMarketplaceTradersMeta = (state) => state.marketplace.tradersMeta;
export const selectMarketplaceFilters = (state) => state.marketplace.filters;
export const selectComparison = (state) => state.marketplace.comparison;
export const selectCurrentProvider = (state) => state.marketplace.currentProvider;
export const selectCurrentTrader = (state) => state.marketplace.currentTrader;

export default marketplaceSlice.reducer;