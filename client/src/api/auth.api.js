/**
 * Auth API
 *
 * Wraps every authentication endpoint exposed by the backend:
 * registration, login, logout, token refresh, email and phone
 * verification, password reset, and two-factor authentication.
 *
 * @module client/src/api/auth.api
 */

import { get, post, patch } from './client.js';
import { endpoints } from './endpoints.js';

export const authApi = {
  register: (payload) => post(endpoints.auth.register, payload),

  login: (payload) => post(endpoints.auth.login, payload),

  logout: () => post(endpoints.auth.logout),

  refresh: (refreshToken) => post(endpoints.auth.refresh, { refreshToken }),

  me: () => get(endpoints.auth.me),

  verifyEmail: (payload) => post(endpoints.auth.verifyEmail, payload),

  resendEmailVerification: (payload) => post(endpoints.auth.resendEmail, payload),

  verifyPhone: (payload) => post(endpoints.auth.verifyPhone, payload),

  resendPhoneVerification: (payload) => post(endpoints.auth.resendPhone, payload),

  forgotPassword: (payload) => post(endpoints.auth.forgotPassword, payload),

  resetPassword: (payload) => post(endpoints.auth.resetPassword, payload),

  changePassword: (payload) => post(endpoints.auth.changePassword, payload),

  setupTwoFactor: () => post(endpoints.auth.twoFactorSetup),

  verifyTwoFactor: (payload) => post(endpoints.auth.twoFactorVerify, payload),

  disableTwoFactor: (payload) => post(endpoints.auth.twoFactorDisable, payload),

  verifySession: (payload) => post(endpoints.auth.sessionVerify, payload),
};

export default authApi;