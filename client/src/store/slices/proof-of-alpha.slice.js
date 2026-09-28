import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getLeaderboard,
  getLeaderboardSummary,
  getProviderVerification,
  getProviderBadge,
  listProviderProofs,
  getProof,
} from '../../api/proof-of-alpha.api';

const initialState = {
  leaderboard: {
    rows: [],
    total: 0,
    window: 'month',
    sortBy: 'total_pnl',
    summary: {},
    cache: null,
  },
  summary: null,
  selectedProof: null,
  providerVerification: {},
  providerBadges: {},
  providerProofs: {},
  loading: false,
  submitting: false,
  error: null,
};

export const fetchLeaderboard = createAsyncThunk(
  'proofOfAlpha/fetchLeaderboard',
  async (options, { rejectWithValue }) => {
    try {
      return await getLeaderboard(options);
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || error?.message || 'Failed to fetch leaderboard',
      );
    }
  },
);

export const fetchLeaderboardSummary = createAsyncThunk(
  'proofOfAlpha/fetchLeaderboardSummary',
  async (options, { rejectWithValue }) => {
    try {
      return await getLeaderboardSummary(options);
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || error?.message || 'Failed to fetch summary',
      );
    }
  },
);

export const fetchProviderVerification = createAsyncThunk(
  'proofOfAlpha/fetchProviderVerification',
  async ({ providerId, options }, { rejectWithValue }) => {
    try {
      const data = await getProviderVerification(providerId, options);
      return { providerId, data };
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || error?.message || 'Failed to fetch verification',
      );
    }
  },
);

export const fetchProviderBadge = createAsyncThunk(
  'proofOfAlpha/fetchProviderBadge',
  async (providerId, { rejectWithValue }) => {
    try {
      const data = await getProviderBadge(providerId);
      return { providerId, data };
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || error?.message || 'Failed to fetch badge',
      );
    }
  },
);

export const fetchProviderProofs = createAsyncThunk(
  'proofOfAlpha/fetchProviderProofs',
  async ({ providerId, filters }, { rejectWithValue }) => {
    try {
      const data = await listProviderProofs(providerId, filters);
      return { providerId, data };
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || error?.message || 'Failed to fetch provider proofs',
      );
    }
  },
);

export const fetchProofById = createAsyncThunk(
  'proofOfAlpha/fetchProofById',
  async (proofId, { rejectWithValue }) => {
    try {
      return await getProof(proofId);
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || error?.message || 'Failed to fetch proof',
      );
    }
  },
);

const proofOfAlphaSlice = createSlice({
  name: 'proofOfAlpha',
  initialState,
  reducers: {
    clearSelectedProof(state) {
      state.selectedProof = null;
    },
    clearError(state) {
      state.error = null;
    },
    clearLeaderboard(state) {
      state.leaderboard = initialState.leaderboard;
    },
    setLeaderboardOptions(state, action) {
      state.leaderboard = {
        ...state.leaderboard,
        ...action.payload,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeaderboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeaderboard.fulfilled, (state, action) => {
        state.loading = false;
        state.leaderboard = {
          rows: action.payload.rows || [],
          total: action.payload.total || 0,
          window: action.payload.window || 'month',
          sortBy: action.payload.sortBy || 'total_pnl',
          summary: action.payload.summary || {},
          cache: action.payload.cache || null,
        };
      })
      .addCase(fetchLeaderboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch leaderboard';
      })

      .addCase(fetchLeaderboardSummary.fulfilled, (state, action) => {
        state.summary = action.payload;
      })

      .addCase(fetchProviderVerification.fulfilled, (state, action) => {
        const { providerId, data } = action.payload;
        state.providerVerification[providerId] = data;
      })

      .addCase(fetchProviderBadge.fulfilled, (state, action) => {
        const { providerId, data } = action.payload;
        state.providerBadges[providerId] = data;
      })

      .addCase(fetchProviderProofs.fulfilled, (state, action) => {
        const { providerId, data } = action.payload;
        state.providerProofs[providerId] = data;
      })

      .addCase(fetchProofById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProofById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProof = action.payload;
      })
      .addCase(fetchProofById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch proof';
      });
  },
});

export const {
  clearSelectedProof,
  clearError,
  clearLeaderboard,
  setLeaderboardOptions,
} = proofOfAlphaSlice.actions;

export default proofOfAlphaSlice.reducer;

export const selectLeaderboard = (state) => state.proofOfAlpha.leaderboard;
export const selectLeaderboardSummary = (state) => state.proofOfAlpha.summary;
export const selectSelectedProof = (state) => state.proofOfAlpha.selectedProof;
export const selectProviderVerification = (state, providerId) =>
  state.proofOfAlpha.providerVerification[providerId];
export const selectProviderBadge = (state, providerId) =>
  state.proofOfAlpha.providerBadges[providerId];
export const selectProviderProofs = (state, providerId) =>
  state.proofOfAlpha.providerProofs[providerId];
export const selectProofLoading = (state) => state.proofOfAlpha.loading;
export const selectProofError = (state) => state.proofOfAlpha.error;