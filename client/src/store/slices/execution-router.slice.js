import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  listSupportedGateways,
  getPolicy,
  savePolicy,
  listRoutes,
  getUsage,
  resolveRoute,
} from '../../api/execution-router.api';

const initialState = {
  gateways: [],
  policy: null,
  routes: [],
  usage: null,
  lastResolution: null,
  loading: false,
  submitting: false,
  error: null,
};

export const fetchGateways = createAsyncThunk(
  'executionRouter/fetchGateways',
  async (_, { rejectWithValue }) => {
    try {
      return await listSupportedGateways();
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || error?.message || 'Failed to fetch gateways',
      );
    }
  },
);

export const fetchPolicy = createAsyncThunk(
  'executionRouter/fetchPolicy',
  async (_, { rejectWithValue }) => {
    try {
      return await getPolicy();
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || error?.message || 'Failed to fetch policy',
      );
    }
  },
);

export const savePolicyThunk = createAsyncThunk(
  'executionRouter/savePolicy',
  async (payload, { rejectWithValue }) => {
    try {
      return await savePolicy(payload);
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || error?.message || 'Failed to save policy',
      );
    }
  },
);

export const fetchRoutes = createAsyncThunk(
  'executionRouter/fetchRoutes',
  async (filters, { rejectWithValue }) => {
    try {
      return await listRoutes(filters);
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || error?.message || 'Failed to fetch routes',
      );
    }
  },
);

export const fetchUsage = createAsyncThunk(
  'executionRouter/fetchUsage',
  async (range, { rejectWithValue }) => {
    try {
      return await getUsage(range);
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || error?.message || 'Failed to fetch usage',
      );
    }
  },
);

export const resolveRouteThunk = createAsyncThunk(
  'executionRouter/resolveRoute',
  async (payload, { rejectWithValue }) => {
    try {
      return await resolveRoute(payload);
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || error?.message || 'Failed to resolve route',
      );
    }
  },
);

const executionRouterSlice = createSlice({
  name: 'executionRouter',
  initialState,
  reducers: {
    clearLastResolution(state) {
      state.lastResolution = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGateways.fulfilled, (state, action) => {
        state.gateways = Array.isArray(action.payload) ? action.payload : [];
      })

      .addCase(fetchPolicy.fulfilled, (state, action) => {
        state.policy = action.payload;
      })

      .addCase(savePolicyThunk.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(savePolicyThunk.fulfilled, (state, action) => {
        state.submitting = false;
        state.policy = action.payload;
      })
      .addCase(savePolicyThunk.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload || 'Failed to save policy';
      })

      .addCase(fetchRoutes.fulfilled, (state, action) => {
        state.routes = action.payload.items || [];
      })

      .addCase(fetchUsage.fulfilled, (state, action) => {
        state.usage = action.payload;
      })

      .addCase(resolveRouteThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resolveRouteThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.lastResolution = action.payload;
      })
      .addCase(resolveRouteThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to resolve route';
      });
  },
});

export const { clearLastResolution, clearError } = executionRouterSlice.actions;

export default executionRouterSlice.reducer;

export const selectGateways = (state) => state.executionRouter.gateways;
export const selectRouterPolicy = (state) => state.executionRouter.policy;
export const selectRoutes = (state) => state.executionRouter.routes;
export const selectRouterUsage = (state) => state.executionRouter.usage;
export const selectLastResolution = (state) => state.executionRouter.lastResolution;
export const selectRouterLoading = (state) => state.executionRouter.loading;
export const selectRouterError = (state) => state.executionRouter.error;