/**
 * Referral Slice
 *
 * Redux slice for referral state: code, network, rewards, wallet, and
 * settlement history.
 *
 * @module client/src/store/slices/referral.slice
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { referralApi } from '../../api/referral.api.js';

export const fetchReferralDashboard = createAsyncThunk(
  'referral/fetchDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await referralApi.getDashboard();
      return response.data.data.dashboard;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || { message: err.message });
    }
  },
);

export const fetchReferralCode = createAsyncThunk(
  'referral/fetchCode',
  async (_, { rejectWithValue }) => {
    try {
      const response = await referralApi.getCode();
      return response.data.data.code;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || { message: err.message });
    }
  },
);

export const fetchReferredUsers = createAsyncThunk(
  'referral/fetchUsers',
  async (params, { rejectWithValue }) => {
    try {
      const response = await referralApi.listReferredUsers(params);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || { message: err.message });
    }
  },
);

export const fetchReferralRewards = createAsyncThunk(
  'referral/fetchRewards',
  async (params, { rejectWithValue }) => {
    try {
      const response = await referralApi.listRewards(params);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || { message: err.message });
    }
  },
);

export const fetchReferralWallet = createAsyncThunk(
  'referral/fetchWallet',
  async (_, { rejectWithValue }) => {
    try {
      const response = await referralApi.getWallet();
      return response.data.data.wallet;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || { message: err.message });
    }
  },
);

export const fetchReferralSettlements = createAsyncThunk(
  'referral/fetchSettlements',
  async (params, { rejectWithValue }) => {
    try {
      const response = await referralApi.listSettlements(params);
      return response.data.data.settlements;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || { message: err.message });
    }
  },
);

export const fetchReferralLeaderboard = createAsyncThunk(
  'referral/fetchLeaderboard',
  async (params, { rejectWithValue }) => {
    try {
      const response = await referralApi.getLeaderboard(params);
      return response.data.data.leaderboard;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || { message: err.message });
    }
  },
);

const initialState = {
  dashboard: null,
  code: null,
  referredUsers: [],
  referredUsersMeta: null,
  rewards: [],
  rewardsMeta: null,
  wallet: {
    pendingBalance: 0,
    availableBalance: 0,
    lifetimeEarned: 0,
    lifetimeWithdrawn: 0,
    currency: 'USD',
  },
  settlements: [],
  leaderboard: [],
  loading: false,
  error: null,
};

const referralSlice = createSlice({
  name: 'referral',
  initialState,
  reducers: {
    setCode(state, action) {
      state.code = action.payload;
    },
    setWallet(state, action) {
      state.wallet = { ...state.wallet, ...action.payload };
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReferralDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReferralDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboard = action.payload || null;
      })
      .addCase(fetchReferralDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Failed to load referral dashboard' };
      })
      .addCase(fetchReferralCode.fulfilled, (state, action) => {
        state.code = action.payload || null;
      })
      .addCase(fetchReferredUsers.fulfilled, (state, action) => {
        state.referredUsers = action.payload?.items || [];
        state.referredUsersMeta = action.payload?.meta || null;
      })
      .addCase(fetchReferralRewards.fulfilled, (state, action) => {
        state.rewards = action.payload?.items || [];
        state.rewardsMeta = action.payload?.meta || null;
      })
      .addCase(fetchReferralWallet.fulfilled, (state, action) => {
        state.wallet = { ...state.wallet, ...(action.payload || {}) };
      })
      .addCase(fetchReferralSettlements.fulfilled, (state, action) => {
        state.settlements = action.payload || [];
      })
      .addCase(fetchReferralLeaderboard.fulfilled, (state, action) => {
        state.leaderboard = action.payload || [];
      });
  },
});

export const { setCode, setWallet, clearError } = referralSlice.actions;

export const selectReferralDashboard = (state) => state.referral.dashboard;
export const selectReferralCode = (state) => state.referral.code;
export const selectReferredUsers = (state) => state.referral.referredUsers;
export const selectReferralRewards = (state) => state.referral.rewards;
export const selectReferralWallet = (state) => state.referral.wallet;
export const selectReferralSettlements = (state) => state.referral.settlements;
export const selectReferralLeaderboard = (state) => state.referral.leaderboard;

export default referralSlice.reducer;