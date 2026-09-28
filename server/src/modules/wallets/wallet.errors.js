/**
 * Wallets Module Errors
 *
 * @module signalforge/server/modules/wallets/errors
 */
const { NotFoundError } = require('../../lib/errors/not-found-error.js');
const { ValidationError } = require('../../lib/errors/validation-error.js');
const { ConflictError } = require('../../lib/errors/conflict-error.js');
const { AuthorizationError } = require('../../lib/errors/authorization-error.js');
class WalletNotFoundError extends NotFoundError {
  constructor(message = 'Wallet not found', details = {}) {
    super(message, { code: 'WALLET_NOT_FOUND', details });
    this.name = 'WalletNotFoundError';
  }
}
class WalletAlreadyExistsError extends ConflictError {
  constructor(message = 'Wallet already exists for this user and type') {
    super(message, { code: 'WALLET_ALREADY_EXISTS' });
    this.name = 'WalletAlreadyExistsError';
  }
}
class WalletNotActiveError extends AuthorizationError {
  constructor(message = 'Wallet is not active', details = {}) {
    super(message, { code: 'WALLET_NOT_ACTIVE', details });
    this.name = 'WalletNotActiveError';
  }
}
class WalletFrozenError extends AuthorizationError {
  constructor(message = 'Wallet is frozen and cannot perform this operation') {
    super(message, { code: 'WALLET_FROZEN' });
    this.name = 'WalletFrozenError';
  }
}
class InsufficientBalanceError extends ConflictError {
  constructor(message = 'Insufficient wallet balance', details = {}) {
    super(message, { code: 'INSUFFICIENT_BALANCE', details });
    this.name = 'InsufficientBalanceError';
  }
}
class InvalidTransactionAmountError extends ValidationError {
  constructor(message = 'Transaction amount is invalid', details = {}) {
    super(message, { code: 'INVALID_TRANSACTION_AMOUNT', details });
    this.name = 'InvalidTransactionAmountError';
  }
}
class LedgerEntryNotFoundError extends NotFoundError {
  constructor(message = 'Ledger entry not found', details = {}) {
    super(message, { code: 'LEDGER_ENTRY_NOT_FOUND', details });
    this.name = 'LedgerEntryNotFoundError';
  }
}
class LedgerEntryAlreadyReversedError extends ConflictError {
  constructor(message = 'Ledger entry has already been reversed') {
    super(message, { code: 'LEDGER_ENTRY_ALREADY_REVERSED' });
    this.name = 'LedgerEntryAlreadyReversedError';
  }
}
class LedgerIntegrityError extends Error {
  constructor(message = 'Ledger integrity check failed', details = {}) {
    super(message);
    this.name = 'LedgerIntegrityError';
    this.code = 'LEDGER_INTEGRITY_ERROR';
    this.details = details;
  }
}
class BalanceCalculationError extends Error {
  constructor(message = 'Balance calculation failed', details = {}) {
    super(message);
    this.name = 'BalanceCalculationError';
    this.code = 'BALANCE_CALCULATION_ERROR';
    this.details = details;
  }
}
module.exports.WalletNotFoundError = WalletNotFoundError;
module.exports.WalletAlreadyExistsError = WalletAlreadyExistsError;
module.exports.WalletNotActiveError = WalletNotActiveError;
module.exports.WalletFrozenError = WalletFrozenError;
module.exports.InsufficientBalanceError = InsufficientBalanceError;
module.exports.InvalidTransactionAmountError = InvalidTransactionAmountError;
module.exports.LedgerEntryNotFoundError = LedgerEntryNotFoundError;
module.exports.LedgerEntryAlreadyReversedError = LedgerEntryAlreadyReversedError;
module.exports.LedgerIntegrityError = LedgerIntegrityError;
module.exports.BalanceCalculationError = BalanceCalculationError;
