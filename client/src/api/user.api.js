/**
 * User API
 *
 * @module client/src/api/user.api
 */

import { get, patch, del } from './client.js';
import { endpoints } from './endpoints.js';

export const userApi = {
  getProfile: () => get(endpoints.users.profile),

  updateProfile: (payload) => patch(endpoints.users.updateProfile, payload),

  getPreferences: () => get(endpoints.users.preferences),

  updatePreferences: (payload) => patch(endpoints.users.preferences, payload),

  listSessions: () => get(endpoints.users.sessions),

  revokeSession: (sessionId) => del(endpoints.users.revokeSession(sessionId)),

  listDevices: () => get(endpoints.users.devices),

  deleteAccount: (payload) => del(endpoints.users.deleteAccount, { data: payload }),

  lookupUser: (userId) => get(endpoints.users.lookup(userId)),
};

export default userApi;