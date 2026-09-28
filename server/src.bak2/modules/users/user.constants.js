/**
 * User Module Constants
 *
 * @module signalforge/server/modules/users/constants
 */
const ACCOUNT_TYPES = Object.freeze({
  USER: 'USER',
  PROVIDER: 'PROVIDER',
  TRADER: 'TRADER',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
});
const USER_PREFERENCE_KEYS = Object.freeze({
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
const USER_EVENTS = Object.freeze({
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
const DEFAULT_LANGUAGE = 'en';
const DEFAULT_TIMEZONE = 'UTC';
const DEFAULT_CURRENCY = 'USD';
const DEFAULT_THEME = 'system';
const ALLOWED_LANGUAGES = Object.freeze([
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
const ALLOWED_THEMES = Object.freeze(['light', 'dark', 'system']);
const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_AVATAR_MIME_TYPES = Object.freeze([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]);
module.exports.ACCOUNT_TYPES = ACCOUNT_TYPES;
module.exports.USER_PREFERENCE_KEYS = USER_PREFERENCE_KEYS;
module.exports.USER_EVENTS = USER_EVENTS;
module.exports.DEFAULT_LANGUAGE = DEFAULT_LANGUAGE;
module.exports.DEFAULT_TIMEZONE = DEFAULT_TIMEZONE;
module.exports.DEFAULT_CURRENCY = DEFAULT_CURRENCY;
module.exports.DEFAULT_THEME = DEFAULT_THEME;
module.exports.ALLOWED_LANGUAGES = ALLOWED_LANGUAGES;
module.exports.ALLOWED_THEMES = ALLOWED_THEMES;
module.exports.MAX_AVATAR_SIZE_BYTES = MAX_AVATAR_SIZE_BYTES;
module.exports.ALLOWED_AVATAR_MIME_TYPES = ALLOWED_AVATAR_MIME_TYPES;
