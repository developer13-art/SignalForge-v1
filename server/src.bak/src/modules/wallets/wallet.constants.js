/**
 * Wallets Module Constants
 *
 * @module signalforge/server/modules/wallets/constants
 */
const WALLET_EVENTS = Object.freeze({
  WALLET_CREATED: 'wallet.created',
  WALLET_UPDATED: 'wallet.updated',
  WALLET_FROZEN: 'wallet.frozen',
  WALLET_UNFROZEN: 'wallet.unfrozen',
  WALLET_CREDITED: 'wallet.credited',
  WALLET_DEBITED: 'wallet.debited',
  LEDGER_ENTRY_CREATED: 'wallet.ledger.entry.created',
  LEDGER_REVERSED: 'wallet.ledger.reversed',
  LEDGER_INTEGRITY_CHECK: 'wallet.ledger.integrity_check',
  BALANCE_RECALCULATED: 'wallet.balance.recalculated',
  INSUFFICIENT_BALANCE: 'wallet.insufficient_balance',
});
const WALLET_STATUSES = Object.freeze({
  ACTIVE: 'ACTIVE',
  FROZEN: 'FROZEN',
  SUSPENDED: 'SUSPENDED',
  CLOSED: 'CLOSED',
});
const WALLET_STATUS_VALUES = Object.freeze(Object.values(WALLET_STATUSES));
const WALLET_TYPES = Object.freeze({
  USER: 'USER',
  PROVIDER: 'PROVIDER',
  REFERRAL: 'REFERRAL',
  PLATFORM: 'PLATFORM',
  ESCROW: 'ESCROW',
});
const WALLET_TYPE_VALUES = Object.freeze(Object.values(WALLET_TYPES));
const LEDGER_ENTRY_DIRECTIONS = Object.freeze({
  CREDIT: 'CREDIT',
  DEBIT: 'DEBIT',
});
const LEDGER_ENTRY_DIRECTION_VALUES = Object.freeze(
  Object.values(LEDGER_ENTRY_DIRECTIONS),
);
const LEDGER_ENTRY_STATUSES = Object.freeze({
  PENDING: 'PENDING',
  POSTED: 'POSTED',
  REVERSED: 'REVERSED',
  FAILED: 'FAILED',
});
const LEDGER_ENTRY_STATUS_VALUES = Object.freeze(
  Object.values(LEDGER_ENTRY_STATUSES),
);
const BALANCE_FIELDS = Object.freeze({
  AVAILABLE: 'available',
  PENDING: 'pending',
  RESERVED: 'reserved',
  TOTAL: 'total',
});
const DEFAULT_CURRENCY = 'USD';
const MIN_TRANSACTION_AMOUNT = 0.01;
const MAX_TRANSACTION_AMOUNT = 1000000;
function isValidWalletStatus(status) {
  return WALLET_STATUS_VALUES.includes(status);
}
function isValidWalletType(type) {
  return WALLET_TYPE_VALUES.includes(type);
}
function isValidLedgerDirection(direction) {
  return LEDGER_ENTRY_DIRECTION_VALUES.includes(direction);
}
function isValidLedgerStatus(status) {
  return LEDGER_ENTRY_STATUS_VALUES.includes(status);
}
function isWalletActive(status) {
  return status === WALLET_STATUSES.ACTIVE;
}
function canWalletDebit(status) {
  return status === WALLET_STATUSES.ACTIVE;
}
function canWalletCredit(status) {
  return [
    WALLET_STATUSES.ACTIVE,
    WALLET_STATUSES.FROZEN,
  ].includes(status);
}
module.exports.WALLET_EVENTS = WALLET_EVENTS;
module.exports.WALLET_STATUSES = WALLET_STATUSES;
module.exports.WALLET_STATUS_VALUES = WALLET_STATUS_VALUES;
module.exports.WALLET_TYPES = WALLET_TYPES;
module.exports.WALLET_TYPE_VALUES = WALLET_TYPE_VALUES;
module.exports.LEDGER_ENTRY_DIRECTIONS = LEDGER_ENTRY_DIRECTIONS;
module.exports.LEDGER_ENTRY_DIRECTION_VALUES = LEDGER_ENTRY_DIRECTION_VALUES;
module.exports.LEDGER_ENTRY_STATUSES = LEDGER_ENTRY_STATUSES;
module.exports.LEDGER_ENTRY_STATUS_VALUES = LEDGER_ENTRY_STATUS_VALUES;
module.exports.BALANCE_FIELDS = BALANCE_FIELDS;
module.exports.DEFAULT_CURRENCY = DEFAULT_CURRENCY;
module.exports.MIN_TRANSACTION_AMOUNT = MIN_TRANSACTION_AMOUNT;
module.exports.MAX_TRANSACTION_AMOUNT = MAX_TRANSACTION_AMOUNT;
module.exports.isValidWalletStatus = isValidWalletStatus;
module.exports.isValidWalletType = isValidWalletType;
module.exports.isValidLedgerDirection = isValidLedgerDirection;
module.exports.isValidLedgerStatus = isValidLedgerStatus;
module.exports.isWalletActive = isWalletActive;
module.exports.canWalletDebit = canWalletDebit;
module.exports.canWalletCredit = canWalletCredit;
