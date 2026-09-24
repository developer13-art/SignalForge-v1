/**
 * User Slice
 *
 * Manages the authenticated user's profile data, preferences, and
 * connected devices. Kept separate from auth so that profile edits do
 * not invalidate the session state.
 *
 * @module client/src/store/slices/user
 */

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  profile: null,
  preferences: {
    theme: 'dark',
    locale: 'en',
    timezone: 'UTC',
    currency: 'USD',
    notifications: {
      email: true,
      push: true,
      inApp: true,
    },
  },
  devices: [],
  connectedAccounts: [],
  isLoading: false,
  isSaving: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    userFetchRequest(state) {
      state.isLoading = true;
      state.error = null;
    },
    userFetchSuccess(state, action) {
      state.isLoading = false;
      state.profile = action.payload || null;
      state.error = null;
    },
    userFetchFailed(state, action) {
      state.isLoading = false;
      state.error = action.payload || 'Failed to load profile';
    },
    userUpdateRequest(state) {
      state.isSaving = true;
      state.error = null;
    },
    userUpdateSuccess(state, action) {
      state.isSaving = false;
      state.profile = { ...state.profile, ...(action.payload || {}) };
      state.error = null;
    },
    userUpdateFailed(state, action) {
      state.isSaving = false;
      state.error = action.payload || 'Failed to update profile';
    },
    preferencesUpdated(state, action) {
      state.preferences = { ...state.preferences, ...(action.payload || {}) };
    },
    devicesLoaded(state, action) {
      state.devices = Array.isArray(action.payload) ? action.payload : [];
    },
    connectedAccountsLoaded(state, action) {
      state.connectedAccounts = Array.isArray(action.payload) ? action.payload : [];
    },
    userReset() {
      return initialState;
    },
  },
});

export const {
  userFetchRequest,
  userFetchSuccess,
  userFetchFailed,
  userUpdateRequest,
  userUpdateSuccess,
  userUpdateFailed,
  preferencesUpdated,
  devicesLoaded,
  connectedAccountsLoaded,
  userReset,
} = userSlice.actions;

export default userSlice.reducer;