/**
 * Auth Slice
 *
 * Manages authentication state: current user session, tokens, login
 * status, MFA state, and login error messages. Access tokens are kept
 * in memory and mirrored to localStorage by the auth API layer so the
 * slice itself stays free of side effects.
 *
 * @module client/src/store/slices/auth
 */

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  requiresEmailVerification: false,
  requiresTwoFactor: false,
  requiresKyc: false,
  twoFactorChallengeToken: null,
  error: null,
  lastLoginAt: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authInitializing(state) {
      state.isLoading = true;
      state.error = null;
    },
    authInitialized(state, action) {
      const payload = action.payload || {};
      state.isLoading = false;
      state.isInitialized = true;
      state.user = payload.user || null;
      state.accessToken = payload.accessToken || null;
      state.refreshToken = payload.refreshToken || null;
      state.isAuthenticated = Boolean(payload.user && payload.accessToken);
      state.requiresEmailVerification = Boolean(payload.requiresEmailVerification);
      state.requiresTwoFactor = Boolean(payload.requiresTwoFactor);
      state.requiresKyc = Boolean(payload.requiresKyc);
      state.lastLoginAt = payload.lastLoginAt || null;
    },
    loginRequest(state) {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess(state, action) {
      const payload = action.payload || {};
      state.isLoading = false;
      state.user = payload.user || null;
      state.accessToken = payload.accessToken || null;
      state.refreshToken = payload.refreshToken || null;
      state.isAuthenticated = true;
      state.requiresEmailVerification = false;
      state.requiresTwoFactor = false;
      state.requiresKyc = Boolean(payload.requiresKyc);
      state.error = null;
      state.lastLoginAt = new Date().toISOString();
    },
    loginRequiresEmailVerification(state, action) {
      state.isLoading = false;
      state.requiresEmailVerification = true;
      state.error = null;
      state.twoFactorChallengeToken = null;
      state.pendingEmail = (action.payload && action.payload.email) || null;
    },
    loginRequiresTwoFactor(state, action) {
      state.isLoading = false;
      state.requiresTwoFactor = true;
      state.twoFactorChallengeToken = action.payload ? action.payload.challengeToken : null;
      state.error = null;
    },
    loginFailed(state, action) {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.error = action.payload || 'Login failed';
    },
    logoutSuccess(state) {
      return { ...initialState, isInitialized: true };
    },
    tokenRefreshed(state, action) {
      const payload = action.payload || {};
      state.accessToken = payload.accessToken || state.accessToken;
      state.refreshToken = payload.refreshToken || state.refreshToken;
    },
    userUpdated(state, action) {
      state.user = action.payload ? { ...state.user, ...action.payload } : state.user;
    },
    kycStatusUpdated(state, action) {
      if (state.user) {
        state.user.kycStatus = action.payload;
      }
      state.requiresKyc = action.payload !== 'VERIFIED';
    },
    clearAuthError(state) {
      state.error = null;
    },
    clearTwoFactorChallenge(state) {
      state.requiresTwoFactor = false;
      state.twoFactorChallengeToken = null;
    },
  },
});

export const {
  authInitializing,
  authInitialized,
  loginRequest,
  loginSuccess,
  loginRequiresEmailVerification,
  loginRequiresTwoFactor,
  loginFailed,
  logoutSuccess,
  tokenRefreshed,
  userUpdated,
  kycStatusUpdated,
  clearAuthError,
  clearTwoFactorChallenge,
} = authSlice.actions;

export default authSlice.reducer;