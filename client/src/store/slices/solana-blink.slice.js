import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  listBlinks,
  getBlink,
  createBlink,
  updateBlink,
  pauseBlink,
  resumeBlink,
  archiveBlink,
  getBlinkAnalytics,
  getBlinkStats,
} from '../../api/solana-blinks.api';

const initialState = {
  items: [],
  total: 0,
  page: 1,
  pageSize: 12,
  filters: {
    templateType: null,
    status: null,
    providerId: null,
  },
  selected: null,
  selectedStats: null,
  analytics: null,
  loading: false,
  submitting: false,
  error: null,
};

export const fetchBlinks = createAsyncThunk(
  'solanaBlink/fetchBlinks',
  async (params, { rejectWithValue }) => {
    try {
      const result = await listBlinks(params);
      return result;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || error?.message || 'Failed to fetch blinks',
      );
    }
  },
);

export const fetchBlinkById = createAsyncThunk(
  'solanaBlink/fetchBlinkById',
  async (blinkId, { rejectWithValue }) => {
    try {
      const [blink, stats] = await Promise.all([getBlink(blinkId), getBlinkStats(blinkId)]);
      return { blink, stats };
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || error?.message || 'Failed to fetch blink',
      );
    }
  },
);

export const createBlinkThunk = createAsyncThunk(
  'solanaBlink/createBlink',
  async (payload, { rejectWithValue }) => {
    try {
      const blink = await createBlink(payload);
      return blink;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || error?.message || 'Failed to create blink',
      );
    }
  },
);

export const updateBlinkThunk = createAsyncThunk(
  'solanaBlink/updateBlink',
  async ({ blinkId, payload }, { rejectWithValue }) => {
    try {
      const blink = await updateBlink(blinkId, payload);
      return blink;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || error?.message || 'Failed to update blink',
      );
    }
  },
);

export const pauseBlinkThunk = createAsyncThunk(
  'solanaBlink/pauseBlink',
  async (blinkId, { rejectWithValue }) => {
    try {
      await pauseBlink(blinkId);
      const blink = await getBlink(blinkId);
      return blink;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || error?.message || 'Failed to pause blink',
      );
    }
  },
);

export const resumeBlinkThunk = createAsyncThunk(
  'solanaBlink/resumeBlink',
  async (blinkId, { rejectWithValue }) => {
    try {
      await resumeBlink(blinkId);
      const blink = await getBlink(blinkId);
      return blink;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || error?.message || 'Failed to resume blink',
      );
    }
  },
);

export const archiveBlinkThunk = createAsyncThunk(
  'solanaBlink/archiveBlink',
  async (blinkId, { rejectWithValue }) => {
    try {
      await archiveBlink(blinkId);
      const blink = await getBlink(blinkId);
      return blink;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || error?.message || 'Failed to archive blink',
      );
    }
  },
);

export const fetchBlinkAnalytics = createAsyncThunk(
  'solanaBlink/fetchBlinkAnalytics',
  async ({ blinkId, ...options }, { rejectWithValue }) => {
    try {
      const analytics = await getBlinkAnalytics(blinkId, options);
      return analytics;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || error?.message || 'Failed to fetch analytics',
      );
    }
  },
);

const solanaBlinkSlice = createSlice({
  name: 'solanaBlink',
  initialState,
  reducers: {
    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
      state.page = 1;
    },
    setPage(state, action) {
      state.page = action.payload;
    },
    setPageSize(state, action) {
      state.pageSize = action.payload;
      state.page = 1;
    },
    clearSelected(state) {
      state.selected = null;
      state.selectedStats = null;
    },
    clearAnalytics(state) {
      state.analytics = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBlinks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBlinks.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
        state.total = action.payload.total || 0;
      })
      .addCase(fetchBlinks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch blinks';
      })

      .addCase(fetchBlinkById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBlinkById.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload.blink;
        state.selectedStats = action.payload.stats;
      })
      .addCase(fetchBlinkById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch blink';
      })

      .addCase(createBlinkThunk.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(createBlinkThunk.fulfilled, (state, action) => {
        state.submitting = false;
        state.items = [action.payload, ...state.items];
        state.total += 1;
      })
      .addCase(createBlinkThunk.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload || 'Failed to create blink';
      })

      .addCase(updateBlinkThunk.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(updateBlinkThunk.fulfilled, (state, action) => {
        state.submitting = false;
        state.items = state.items.map((item) =>
          item.id === action.payload.id ? action.payload : item,
        );
        if (state.selected && state.selected.id === action.payload.id) {
          state.selected = action.payload;
        }
      })
      .addCase(updateBlinkThunk.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload || 'Failed to update blink';
      })

      .addCase(pauseBlinkThunk.fulfilled, (state, action) => {
        state.items = state.items.map((item) =>
          item.id === action.payload.id ? action.payload : item,
        );
        if (state.selected && state.selected.id === action.payload.id) {
          state.selected = action.payload;
        }
      })
      .addCase(resumeBlinkThunk.fulfilled, (state, action) => {
        state.items = state.items.map((item) =>
          item.id === action.payload.id ? action.payload : item,
        );
        if (state.selected && state.selected.id === action.payload.id) {
          state.selected = action.payload;
        }
      })
      .addCase(archiveBlinkThunk.fulfilled, (state, action) => {
        state.items = state.items.map((item) =>
          item.id === action.payload.id ? action.payload : item,
        );
        if (state.selected && state.selected.id === action.payload.id) {
          state.selected = action.payload;
        }
      })

      .addCase(fetchBlinkAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBlinkAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.analytics = action.payload;
      })
      .addCase(fetchBlinkAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch analytics';
      });
  },
});

export const {
  setFilters,
  setPage,
  setPageSize,
  clearSelected,
  clearAnalytics,
  clearError,
} = solanaBlinkSlice.actions;

export default solanaBlinkSlice.reducer;

export const selectBlinks = (state) => state.solanaBlink.items;
export const selectBlinksTotal = (state) => state.solanaBlink.total;
export const selectBlinksLoading = (state) => state.solanaBlink.loading;
export const selectBlinkError = (state) => state.solanaBlink.error;
export const selectSelectedBlink = (state) => state.solanaBlink.selected;
export const selectSelectedBlinkStats = (state) => state.solanaBlink.selectedStats;
export const selectBlinkAnalytics = (state) => state.solanaBlink.analytics;
export const selectBlinkFilters = (state) => state.solanaBlink.filters;