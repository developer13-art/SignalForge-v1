/**
 * Account Statuses
 *
 * Defines the possible states of a user account in the SignalForge platform.
 *
 * @module @signalforge/shared/constants/account-statuses
 */const ACCOUNT_STATUSES = Object.freeze({
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  LOCKED: 'LOCKED',
  BANNED: 'BANNED',
  DEACTIVATED: 'DEACTIVATED',
});const ACCOUNT_STATUS_VALUES = Object.freeze(Object.values(ACCOUNT_STATUSES));const ACCOUNT_STATUS_LABELS = Object.freeze({
  [ACCOUNT_STATUSES.ACTIVE]: 'Active',
  [ACCOUNT_STATUSES.SUSPENDED]: 'Suspended',
  [ACCOUNT_STATUSES.LOCKED]: 'Locked',
  [ACCOUNT_STATUSES.BANNED]: 'Banned',
  [ACCOUNT_STATUSES.DEACTIVATED]: 'Deactivated',
});const ACCOUNT_STATUS_DESCRIPTIONS = Object.freeze({
  [ACCOUNT_STATUSES.ACTIVE]: 'Account is active and can access all permitted features.',
  [ACCOUNT_STATUSES.SUSPENDED]: 'Account is temporarily suspended. Financial actions are disabled.',
  [ACCOUNT_STATUSES.LOCKED]: 'Account is locked due to security concerns. Requires admin unlock.',
  [ACCOUNT_STATUSES.BANNED]: 'Account is permanently banned for policy violations.',
  [ACCOUNT_STATUSES.DEACTIVATED]: 'Account has been deactivated by the user.',
});const FINANCIAL_ACTION_ALLOWED_STATUSES = Object.freeze([
  ACCOUNT_STATUSES.ACTIVE,
]);function isAccountActive(status) {
  return status === ACCOUNT_STATUSES.ACTIVE;
}function canPerformFinancialAction(status) {
  return FINANCIAL_ACTION_ALLOWED_STATUSES.includes(status);
}

module.exports.isAccountActive = isAccountActive;
module.exports.canPerformFinancialAction = canPerformFinancialAction;
module.exports.ACCOUNT_STATUSES = ACCOUNT_STATUSES;
module.exports.ACCOUNT_STATUS_VALUES = ACCOUNT_STATUS_VALUES;
module.exports.ACCOUNT_STATUS_LABELS = ACCOUNT_STATUS_LABELS;
module.exports.ACCOUNT_STATUS_DESCRIPTIONS = ACCOUNT_STATUS_DESCRIPTIONS;
module.exports.FINANCIAL_ACTION_ALLOWED_STATUSES = FINANCIAL_ACTION_ALLOWED_STATUSES;
