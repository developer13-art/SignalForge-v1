/**
 * User Module Constants
 *
 * @module signalforge/server/modules/users/constants
 */

export const ACCOUNT_TYPES = Object.freeze({
  USER: 'USER',
  PROVIDER: 'PROVIDER',
  TRADER: 'TRADER',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
});

export const USER_PREFERENCE_KEYS = Object.freeze({
  LANGUAGE: 'language',
  TIMEZONE: 'timezone',
  CURRENCY: 'currency',
  THEME: 'theme',
  EMAIL_NOTIFICATIONS: 'emailNotifications',
  PUSH_NOTIFICATIONS: 'pushNotifications',
  SMS_NOTIFICATIONS: 'smsNotifications',
  MARKETING_EMAILS: 'marketingEmails',
  SECURITY_ALERTS: 'securityAlerts',
  AUTO_TRADING_ENABLED: 'autoTradingEnabled',
  DEFAULT_ACCOUNT_TYPE: 'defaultAccountType',
  DEFAULT_RISK_PERCENT: 'defaultRiskPercent',
  DEFAULT_LOT_SIZE: 'defaultLotSize',
});

export const USER_EVENTS = Object.freeze({
  USER_UPDATED: 'user.updated',
  PROFILE_UPDATED: 'user.profile.updated',
  PREFERENCES_UPDATED: 'user.preferences.updated',
  AVATAR_UPDATED: 'user.avatar.updated',
  AVATAR_REMOVED: 'user.avatar.removed',
  SESSION_REVOKED: 'user.session.revoked',
  DEVICE_REMOVED: 'user.device.removed',
  API_KEY_CREATED: 'user.api_key.created',
  API_KEY_REVOKED: 'user.api_key.revoked',
  ACCOUNT_DEACTIVATED: 'user.account.deactivated',
  ACCOUNT_REACTIVATED: 'user.account.reactivated',
});

export const DEFAULT_LANGUAGE = 'en';
export const DEFAULT_TIMEZONE = 'UTC';
export const DEFAULT_CURRENCY = 'USD';
export const DEFAULT_THEME = 'system';

export const ALLOWED_LANGUAGES = Object.freeze([
  'en',
  'pt',
  'es',
  'fr',
  'de',
  'it',
  'ru',
  'ar',
  'zh',
  'ja',
]);

export const ALLOWED_THEMES = Object.freeze(['light', 'dark', 'system']);

export const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;

export const ALLOWED_AVATAR_MIME_TYPES = Object.freeze([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]);