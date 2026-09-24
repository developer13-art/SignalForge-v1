/**
 * Wallets Module Constants
 *
 * @module signalforge/server/modules/wallets/constants
 */

export const WALLET_EVENTS = Object.freeze({
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

export const WALLET_STATUSES = Object.freeze({
  ACTIVE: 'ACTIVE',
  FROZEN: 'FROZEN',
  SUSPENDED: 'SUSPENDED',
  CLOSED: 'CLOSED',
});

export const WALLET_STATUS_VALUES = Object.freeze(Object.values(WALLET_STATUSES));

export const WALLET_TYPES = Object.freeze({
  USER: 'USER',
  PROVIDER: 'PROVIDER',
  REFERRAL: 'REFERRAL',
  PLATFORM: 'PLATFORM',
  ESCROW: 'ESCROW',
});

export const WALLET_TYPE_VALUES = Object.freeze(Object.values(WALLET_TYPES));

export const LEDGER_ENTRY_DIRECTIONS = Object.freeze({
  CREDIT: 'CREDIT',
  DEBIT: 'DEBIT',
});

export const LEDGER_ENTRY_DIRECTION_VALUES = Object.freeze(
  Object.values(LEDGER_ENTRY_DIRECTIONS),
);

export const LEDGER_ENTRY_STATUSES = Object.freeze({
  PENDING: 'PENDING',
  POSTED: 'POSTED',
  REVERSED: 'REVERSED',
  FAILED: 'FAILED',
});

export const LEDGER_ENTRY_STATUS_VALUES = Object.freeze(
  Object.values(LEDGER_ENTRY_STATUSES),
);

export const BALANCE_FIELDS = Object.freeze({
  AVAILABLE: 'available',
  PENDING: 'pending',
  RESERVED: 'reserved',
  TOTAL: 'total',
});

export const DEFAULT_CURRENCY = 'USD';
export const MIN_TRANSACTION_AMOUNT = 0.01;
export const MAX_TRANSACTION_AMOUNT = 1000000;

export function isValidWalletStatus(status) {
  return WALLET_STATUS_VALUES.includes(status);
}

export function isValidWalletType(type) {
  return WALLET_TYPE_VALUES.includes(type);
}

export function isValidLedgerDirection(direction) {
  return LEDGER_ENTRY_DIRECTION_VALUES.includes(direction);
}

export function isValidLedgerStatus(status) {
  return LEDGER_ENTRY_STATUS_VALUES.includes(status);
}

export function isWalletActive(status) {
  return status === WALLET_STATUSES.ACTIVE;
}

export function canWalletDebit(status) {
  return status === WALLET_STATUSES.ACTIVE;
}

export function canWalletCredit(status) {
  return [
    WALLET_STATUSES.ACTIVE,
    WALLET_STATUSES.FROZEN,
  ].includes(status);
}