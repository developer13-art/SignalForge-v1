/**
 * Account Types
 *
 * Defines the broker account types supported by SignalForge: demo,
 * live, or contest.
 *
 * @module @signalforge/shared/constants/account-types
 */const ACCOUNT_TYPES = Object.freeze({
  DEMO: 'DEMO',
  LIVE: 'LIVE',
  CONTEST: 'CONTEST',
});const ACCOUNT_TYPE_VALUES = Object.freeze(Object.values(ACCOUNT_TYPES));const ACCOUNT_TYPE_LABELS = Object.freeze({
  [ACCOUNT_TYPES.DEMO]: 'Demo Account',
  [ACCOUNT_TYPES.LIVE]: 'Live Account',
  [ACCOUNT_TYPES.CONTEST]: 'Contest Account',
});const ACCOUNT_TYPE_DESCRIPTIONS = Object.freeze({
  [ACCOUNT_TYPES.DEMO]: 'Simulated trading account. No real money at risk.',
  [ACCOUNT_TYPES.LIVE]: 'Real trading account with actual capital.',
  [ACCOUNT_TYPES.CONTEST]: 'Competition account used for contests.',
});const REAL_MONEY_ACCOUNT_TYPES = Object.freeze([
  ACCOUNT_TYPES.LIVE,
]);function isRealMoneyAccount(type) {
  return REAL_MONEY_ACCOUNT_TYPES.includes(type);
}function isValidAccountType(type) {
  return ACCOUNT_TYPE_VALUES.includes(type);
}

module.exports.isRealMoneyAccount = isRealMoneyAccount;
module.exports.isValidAccountType = isValidAccountType;
module.exports.ACCOUNT_TYPES = ACCOUNT_TYPES;
module.exports.ACCOUNT_TYPE_VALUES = ACCOUNT_TYPE_VALUES;
module.exports.ACCOUNT_TYPE_LABELS = ACCOUNT_TYPE_LABELS;
module.exports.ACCOUNT_TYPE_DESCRIPTIONS = ACCOUNT_TYPE_DESCRIPTIONS;
module.exports.REAL_MONEY_ACCOUNT_TYPES = REAL_MONEY_ACCOUNT_TYPES;
