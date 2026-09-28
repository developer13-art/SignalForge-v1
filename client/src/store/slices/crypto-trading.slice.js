import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  listCryptoPositions,
  listCryptoOrders,
  listCryptoHistory,
  closeCryptoPosition,
  cancelCryptoOrder,
  getTradingWallet,
  registerTradingWallet,
  unregisterTradingWallet,
} from '../../api/crypto-trading.api';

const initialState = {
  positions: [],
  orders: [],
  history: [],
  wallet: null,
  loading: false,
  submitting: false,
  error: null,
};

export const fetchCryptoPositions = createAsyncThunk(
  'cryptoTrading/fetchCryptoPositions',
  async (filters, { rejectWithValue }) => {
    try {
      return await listCryptoPositions(filters);
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || error?.message || 'Failed to fetch positions',
      );
    }
  },
);

export const fetchCryptoOrders = createAsyncThunk(
  'cryptoTrading/fetchCryptoOrders',
  async (filters, { rejectWithValue }) => {
    try {
      return await listCryptoOrders(filters);
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || error?.message || 'Failed to fetch orders',
      );
    }
  },
);

export const fetchCryptoHistory = createAsyncThunk(
  'cryptoTrading/fetchCryptoHistory',
  async (filters, { rejectWithValue }) => {
    try {
      return await listCryptoHistory(filters);
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || error?.message || 'Failed to fetch history',
      );
    }
  },
);

export const closeCryptoPositionThunk = createAsyncThunk(
  'cryptoTrading/closeCryptoPosition',
  async ({ positionId, payload }, { rejectWithValue }) => {
    try {
      await closeCryptoPosition(positionId, payload);
      return { positionId };
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || error?.message || 'Failed to close position',
      );
    }
  },
);

export const cancelCryptoOrderThunk = createAsyncThunk(
  'cryptoTrading/cancelCryptoOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      await cancelCryptoOrder(orderId);
      return { orderId };
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || error?.message || 'Failed to cancel order',
      );
    }
  },
);

export const fetchTradingWallet = createAsyncThunk(
  'cryptoTrading/fetchTradingWallet',
  async (_, { rejectWithValue }) => {
    try {
      return await getTradingWallet();
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || error?.message || 'Failed to fetch wallet',
      );
    }
  },
);

export const registerTradingWalletThunk = createAsyncThunk(
  'cryptoTrading/registerTradingWallet',
  async (payload, { rejectWithValue }) => {
    try {
      return await registerTradingWallet(payload);
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || error?.message || 'Failed to register wallet',
      );
    }
  },
);

export const unregisterTradingWalletThunk = createAsyncThunk(
  'cryptoTrading/unregisterTradingWallet',
  async (_, { rejectWithValue }) => {
    try {
      await unregisterTradingWallet();
      return null;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || error?.message || 'Failed to unregister wallet',
      );
    }
  },
);

const cryptoTradingSlice = createSlice({
  name: 'cryptoTrading',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    clearPositions(state) {
      state.positions = [];
    },
    clearOrders(state) {
      state.orders = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCryptoPositions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCryptoPositions.fulfilled, (state, action) => {
        state.loading = false;
        state.positions = action.payload.items || [];
      })
      .addCase(fetchCryptoPositions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch positions';
      })

      .addCase(fetchCryptoOrders.fulfilled, (state, action) => {
        state.orders = action.payload.items || [];
      })

      .addCase(fetchCryptoHistory.fulfilled, (state, action) => {
        state.history = action.payload.items || [];
      })

      .addCase(closeCryptoPositionThunk.fulfilled, (state, action) => {
        state.positions = state.positions.filter(
          (position) => position.id !== action.payload.positionId,
        );
      })

      .addCase(cancelCryptoOrderThunk.fulfilled, (state, action) => {
        state.orders = state.orders.map((order) =>
          order.id === action.payload.orderId ? { ...order, status: 'cancelled' } : order,
        );
      })

      .addCase(fetchTradingWallet.fulfilled, (state, action) => {
        state.wallet = action.payload;
      })

      .addCase(registerTradingWalletThunk.fulfilled, (state, action) => {
        state.wallet = action.payload;
      })

      .addCase(unregisterTradingWalletThunk.fulfilled, (state) => {
        state.wallet = null;
      });
  },
});

export const { clearError, clearPositions, clearOrders } = cryptoTradingSlice.actions;

export default cryptoTradingSlice.reducer;

export const selectCryptoPositions = (state) => state.cryptoTrading.positions;
export const selectCryptoOrders = (state) => state.cryptoTrading.orders;
export const selectCryptoHistory = (state) => state.cryptoTrading.history;
export const selectTradingWallet = (state) => state.cryptoTrading.wallet;
export const selectCryptoLoading = (state) => state.cryptoTrading.loading;
export const selectCryptoError = (state) => state.cryptoTrading.error;