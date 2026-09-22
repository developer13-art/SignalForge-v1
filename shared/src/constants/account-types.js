/**
 * Account Types
 *
 * Defines the broker account types supported by SignalForge: demo,
 * live, or contest.
 *
 * @module @signalforge/shared/constants/account-types
 */

export const ACCOUNT_TYPES = Object.freeze({
  DEMO: 'DEMO',
  LIVE: 'LIVE',
  CONTEST: 'CONTEST',
});

export const ACCOUNT_TYPE_VALUES = Object.freeze(Object.values(ACCOUNT_TYPES));

export const ACCOUNT_TYPE_LABELS = Object.freeze({
  [ACCOUNT_TYPES.DEMO]: 'Demo Account',
  [ACCOUNT_TYPES.LIVE]: 'Live Account',
  [ACCOUNT_TYPES.CONTEST]: 'Contest Account',
});

export const ACCOUNT_TYPE_DESCRIPTIONS = Object.freeze({
  [ACCOUNT_TYPES.DEMO]: 'Simulated trading account. No real money at risk.',
  [ACCOUNT_TYPES.LIVE]: 'Real trading account with actual capital.',
  [ACCOUNT_TYPES.CONTEST]: 'Competition account used for contests.',
});

export const REAL_MONEY_ACCOUNT_TYPES = Object.freeze([
  ACCOUNT_TYPES.LIVE,
]);

export function isRealMoneyAccount(type) {
  return REAL_MONEY_ACCOUNT_TYPES.includes(type);
}

export function isValidAccountType(type) {
  return ACCOUNT_TYPE_VALUES.includes(type);
}