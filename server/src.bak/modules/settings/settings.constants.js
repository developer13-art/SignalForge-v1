/**
 * Settings Constants
 *
 * Shared constants for the settings module. Defines categories,
 * allowed value types, and reserved keys.
 *
 * @module server/modules/settings/settings.constants
 */

export const SETTING_CATEGORIES = Object.freeze({
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

export const SETTING_CATEGORY_VALUES = Object.freeze(Object.values(SETTING_CATEGORIES));

export const SETTING_VALUE_TYPES = Object.freeze({
  STRING: 'string',
  NUMBER: 'number',
  BOOLEAN: 'boolean',
  JSON: 'json',
});

export const SETTING_VALUE_TYPE_VALUES = Object.freeze(Object.values(SETTING_VALUE_TYPES));

export const RESERVED_SETTING_KEYS = Object.freeze([
  'security.encryption_key',
  'security.jwt_secret',
  'security.session_secret',
  'metaapi.token',
  'telegram.api_hash',
  'telegram.session_encryption_key',
  'stripe.secret_key',
  'paystack.secret_key',
]);

export function isValidCategory(category) {
  return SETTING_CATEGORY_VALUES.includes(category);
}

export function isValidValueType(valueType) {
  return SETTING_VALUE_TYPE_VALUES.includes(valueType);
}

export function isReservedKey(key) {
  return RESERVED_SETTING_KEYS.includes(key);
}