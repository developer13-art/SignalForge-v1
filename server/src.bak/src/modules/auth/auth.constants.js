/**
 * Auth Module Constants
 *
 * @module signalforge/server/modules/auth/constants
 */
const AUTH_METHODS = Object.freeze({
  PASSWORD: 'PASSWORD',
  REFRESH_TOKEN: 'REFRESH_TOKEN',
  API_KEY: 'API_KEY',
  TWO_FACTOR: 'TWO_FACTOR',
  SOCIAL: 'SOCIAL',
  SOLANA: 'SOLANA',
});
const TOKEN_TYPES = Object.freeze({
  ACCESS: 'ACCESS',
  REFRESH: 'REFRESH',
  EMAIL_VERIFICATION: 'EMAIL_VERIFICATION',
  PHONE_VERIFICATION: 'PHONE_VERIFICATION',
  PASSWORD_RESET: 'PASSWORD_RESET',
  TWO_FACTOR_CHALLENGE: 'TWO_FACTOR_CHALLENGE',
  API_KEY: 'API_KEY',
});
const TWO_FACTOR_METHODS = Object.freeze({
  TOTP: 'TOTP',
  SMS: 'SMS',
  EMAIL: 'EMAIL',
});
const SESSION_STATUSES = Object.freeze({
  ACTIVE: 'ACTIVE',
  REVOKED: 'REVOKED',
  EXPIRED: 'EXPIRED',
});
const DEVICE_TYPES = Object.freeze({
  WEB: 'WEB',
  MOBILE: 'MOBILE',
  DESKTOP: 'DESKTOP',
  TABLET: 'TABLET',
  UNKNOWN: 'UNKNOWN',
});
const LOGIN_STATUSES = Object.freeze({
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  CHALLENGE_REQUIRED: 'CHALLENGE_REQUIRED',
  LOCKED: 'LOCKED',
});
const AUTH_EVENTS = Object.freeze({
  USER_REGISTERED: 'auth.user.registered',
  USER_LOGGED_IN: 'auth.user.logged_in',
  USER_LOGGED_OUT: 'auth.user.logged_out',
  LOGIN_FAILED: 'auth.login.failed',
  ACCOUNT_LOCKED: 'auth.account.locked',
  PASSWORD_RESET_REQUESTED: 'auth.password.reset_requested',
  PASSWORD_RESET_COMPLETED: 'auth.password.reset_completed',
  PASSWORD_CHANGED: 'auth.password.changed',
  EMAIL_VERIFICATION_SENT: 'auth.email.verification_sent',
  EMAIL_VERIFIED: 'auth.email.verified',
  PHONE_VERIFICATION_SENT: 'auth.phone.verification_sent',
  PHONE_VERIFIED: 'auth.phone.verified',
  TWO_FACTOR_ENABLED: 'auth.two_factor.enabled',
  TWO_FACTOR_DISABLED: 'auth.two_factor.disabled',
  TWO_FACTOR_CHALLENGE: 'auth.two_factor.challenge',
  TWO_FACTOR_VERIFIED: 'auth.two_factor.verified',
  SESSION_REVOKED: 'auth.session.revoked',
  DEVICE_ADDED: 'auth.device.added',
  DEVICE_REMOVED: 'auth.device.removed',
  SUSPICIOUS_ACTIVITY: 'auth.suspicious_activity',
});
const MAX_FAILED_LOGIN_ATTEMPTS = 5;
const FAILED_LOGIN_WINDOW_MINUTES = 15;
const LOCKOUT_DURATION_MINUTES = 30;
const OTP_CODE_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 10;
const OTP_MAX_ATTEMPTS = 5;
const RESERVED_EMAILS = Object.freeze([
  'admin@signalforge.ai',
  'support@signalforge.ai',
  'no-reply@signalforge.ai',
  'system@signalforge.ai',
]);
const DEFAULT_ROLE_ON_REGISTRATION = 'USER';
module.exports.AUTH_METHODS = AUTH_METHODS;
module.exports.TOKEN_TYPES = TOKEN_TYPES;
module.exports.TWO_FACTOR_METHODS = TWO_FACTOR_METHODS;
module.exports.SESSION_STATUSES = SESSION_STATUSES;
module.exports.DEVICE_TYPES = DEVICE_TYPES;
module.exports.LOGIN_STATUSES = LOGIN_STATUSES;
module.exports.AUTH_EVENTS = AUTH_EVENTS;
module.exports.MAX_FAILED_LOGIN_ATTEMPTS = MAX_FAILED_LOGIN_ATTEMPTS;
module.exports.FAILED_LOGIN_WINDOW_MINUTES = FAILED_LOGIN_WINDOW_MINUTES;
module.exports.LOCKOUT_DURATION_MINUTES = LOCKOUT_DURATION_MINUTES;
module.exports.OTP_CODE_LENGTH = OTP_CODE_LENGTH;
module.exports.OTP_EXPIRY_MINUTES = OTP_EXPIRY_MINUTES;
module.exports.OTP_MAX_ATTEMPTS = OTP_MAX_ATTEMPTS;
module.exports.RESERVED_EMAILS = RESERVED_EMAILS;
module.exports.DEFAULT_ROLE_ON_REGISTRATION = DEFAULT_ROLE_ON_REGISTRATION;
