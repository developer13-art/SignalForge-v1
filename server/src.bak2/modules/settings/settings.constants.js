/**
 * Settings Constants
 *
 * Shared constants for the settings module. Defines categories,
 * allowed value types, and reserved keys.
 *
 * @module server/modules/settings/settings.constants
 */
const SETTING_CATEGORIES = Object.freeze({
  GENERAL: 'general',
  TRADING: 'trading',
  NOTIFICATIONS: 'notifications',
  SECURITY: 'security',
  KYC: 'kyc',
  REFERRALS: 'referrals',
  SUBSCRIPTIONS: 'subscriptions',
  SOLANA: 'solana',
  UI: 'ui',
});
const SETTING_CATEGORY_VALUES = Object.freeze(Object.values(SETTING_CATEGORIES));
const SETTING_VALUE_TYPES = Object.freeze({
  STRING: 'string',
  NUMBER: 'number',
  BOOLEAN: 'boolean',
  JSON: 'json',
});
const SETTING_VALUE_TYPE_VALUES = Object.freeze(Object.values(SETTING_VALUE_TYPES));
const RESERVED_SETTING_KEYS = Object.freeze([
  'security.encryption_key',
  'security.jwt_secret',
  'security.session_secret',
  'metaapi.token',
  'telegram.api_hash',
  'telegram.session_encryption_key',
  'stripe.secret_key',
  'paystack.secret_key',
]);
function isValidCategory(category) {
  return SETTING_CATEGORY_VALUES.includes(category);
}
function isValidValueType(valueType) {
  return SETTING_VALUE_TYPE_VALUES.includes(valueType);
}
function isReservedKey(key) {
  return RESERVED_SETTING_KEYS.includes(key);
}
module.exports.SETTING_CATEGORIES = SETTING_CATEGORIES;
module.exports.SETTING_CATEGORY_VALUES = SETTING_CATEGORY_VALUES;
module.exports.SETTING_VALUE_TYPES = SETTING_VALUE_TYPES;
module.exports.SETTING_VALUE_TYPE_VALUES = SETTING_VALUE_TYPE_VALUES;
module.exports.RESERVED_SETTING_KEYS = RESERVED_SETTING_KEYS;
module.exports.isValidCategory = isValidCategory;
module.exports.isValidValueType = isValidValueType;
module.exports.isReservedKey = isReservedKey;
