/**
 * Auth Selectors
 *
 * @module client/src/store/selectors/auth.selectors
 */

export const selectAuthState = (state) => state.auth;

export const selectCurrentUser = (state) => state.auth.user;

export const selectAccessToken = (state) => state.auth.accessToken;

export const selectRefreshToken = (state) => state.auth.refreshToken;

export const selectIsAuthenticated = (state) =>
  Boolean(state.auth.accessToken && state.auth.user);

export const selectAuthLoading = (state) => state.auth.loading;

export const selectAuthError = (state) => state.auth.error;

export const selectAuthInitialized = (state) => state.auth.initialized;

export const selectTwoFactorRequired = (state) => state.auth.twoFactorRequired;

export const selectAuthRoles = (state) => state.auth.user?.roles || [];

export const selectHasRole = (roleName) => (state) => {
  const roles = state.auth.user?.roles || [];
  return roles.includes(roleName);
};

export const selectHasAnyRole = (roleNames) => (state) => {
  const roles = state.auth.user?.roles || [];
  return roleNames.some((r) => roles.includes(r));
};

export const selectAuthUser = (state) => state.auth.user;

export const selectAuthStatus = (state) => {
  if (state.auth.twoFactorRequired) {
    return 'two_factor_required';
  }
  if (state.auth.loading) {
    return state.auth.initialized ? 'loading' : 'authenticating';
  }
  if (state.auth.error) {
    return 'error';
  }
  if (state.auth.accessToken && state.auth.user) {
    return 'authenticated';
  }
  return 'unauthenticated';
};