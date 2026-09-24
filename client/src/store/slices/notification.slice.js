/**
 * Notification Slice
 *
 * Redux slice for notification state: in-app notifications, unread
 * count, preferences, and delivered toasts.
 *
 * @module client/src/store/slices/notification.slice
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notificationApi } from '../../api/notification.api.js';

export const fetchNotifications = createAsyncThunk(
  'notification/fetchNotifications',
  async (params, { rejectWithValue }) => {
    try {
      const response = await notificationApi.listNotifications(params);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || { message: err.message });
    }
  },
);

export const fetchUnreadCount = createAsyncThunk(
  'notification/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationApi.getUnreadCount();
      return response.data.data.unreadCount;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || { message: err.message });
    }
  },
);

export const markNotificationRead = createAsyncThunk(
  'notification/markRead',
  async ({ notificationId }, { rejectWithValue }) => {
    try {
      await notificationApi.markAsRead({ notificationId });
      return notificationId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || { message: err.message });
    }
  },
);

export const markAllNotificationsRead = createAsyncThunk(
  'notification/markAllRead',
  async (_, { rejectWithValue }) => {
    try {
      await notificationApi.markAllAsRead();
      return true;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || { message: err.message });
    }
  },
);

export const fetchNotificationPreferences = createAsyncThunk(
  'notification/fetchPreferences',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationApi.getPreferences();
      return response.data.data.preferences;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || { message: err.message });
    }
  },
);

export const updateNotificationPreferences = createAsyncThunk(
  'notification/updatePreferences',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await notificationApi.updatePreferences(payload);
      return response.data.data.preferences;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || { message: err.message });
    }
  },
);

const initialState = {
  notifications: [],
  notificationsMeta: null,
  unreadCount: 0,
  preferences: null,
  filters: {
    status: null,
    category: null,
    unreadOnly: false,
  },
  loading: false,
  error: null,
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    addNotification(state, action) {
      state.notifications = [action.payload, ...state.notifications];
      if (!action.payload.readAt) {
        state.unreadCount += 1;
      }
    },
    incrementUnread(state) {
      state.unreadCount += 1;
    },
    resetUnread(state) {
      state.unreadCount = 0;
    },
    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload?.items || [];
        state.notificationsMeta = action.payload?.meta || null;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Failed to load notifications' };
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload || 0;
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const notification = state.notifications.find((n) => n.notificationId === action.payload);
        if (notification && !notification.readAt) {
          notification.readAt = new Date().toISOString();
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.notifications = state.notifications.map((n) => ({
          ...n,
          readAt: n.readAt || new Date().toISOString(),
        }));
        state.unreadCount = 0;
      })
      .addCase(fetchNotificationPreferences.fulfilled, (state, action) => {
        state.preferences = action.payload || null;
      })
      .addCase(updateNotificationPreferences.fulfilled, (state, action) => {
        state.preferences = action.payload || null;
      });
  },
});

export const {
  addNotification,
  incrementUnread,
  resetUnread,
  setFilters,
  clearError,
} = notificationSlice.actions;

export const selectNotifications = (state) => state.notification.notifications;
export const selectNotificationsMeta = (state) => state.notification.notificationsMeta;
export const selectUnreadCount = (state) => state.notification.unreadCount;
export const selectNotificationPreferences = (state) => state.notification.preferences;
export const selectNotificationFilters = (state) => state.notification.filters;

export default notificationSlice.reducer;