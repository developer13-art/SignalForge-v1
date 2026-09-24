/**
 * User Selectors
 *
 * @module client/src/store/selectors/user.selectors
 */

export const selectUserState = (state) => state.user;

export const selectUserProfile = (state) => state.user.profile;

export const selectUserPreferences = (state) => state.user.preferences;

export const selectUserNotifications = (state) => state.user.notifications;

export const selectUserSessions = (state) => state.user.sessions;

export const selectUserDevices = (state) => state.user.devices;

export const selectUserConnectedAccounts = (state) => state.user.connectedAccounts;

export const selectUserLoading = (state) => state.user.loading;

export const selectUserError = (state) => state.user.error;

export const selectDisplayName = (state) => {
  const profile = state.user.profile;
  if (!profile) {
    return '';
  }
  const parts = [profile.firstName, profile.lastName].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : profile.username || profile.email || '';
};

export const selectUserInitials = (state) => {
  const profile = state.user.profile;
  if (!profile) {
    return '';
  }
  const first = profile.firstName ? profile.firstName.charAt(0) : '';
  const last = profile.lastName ? profile.lastName.charAt(0) : '';
  return `${first}${last}`.toUpperCase();
};