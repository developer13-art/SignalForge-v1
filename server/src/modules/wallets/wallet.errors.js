/**
 * Wallets Module Errors
 *
 * @module signalforge/server/modules/wallets/errors
 */

import { NotFoundError } from '../../lib/errors/not-found-error.js';
import { ValidationError } from '../../lib/errors/validation-error.js';
import { ConflictError } from '../../lib/errors/conflict-error.js';
import { AuthorizationError } from '../../lib/errors/authorization-error.js';

export class WalletNotFoundError extends NotFoundError {
  constructor(message = 'Wallet not found', details = {}) {
    super(message, { code: 'WALLET_NOT_FOUND', details });
    this.name = 'WalletNotFoundError';
  }
}

export class WalletAlreadyExistsError extends ConflictError {
  constructor(message = 'Wallet already exists for this user and type') {
    super(message, { code: 'WALLET_ALREADY_EXISTS' });
    this.name = 'WalletAlreadyExistsError';
  }
}

export class WalletNotActiveError extends AuthorizationError {
  constructor(message = 'Wallet is not active', details = {}) {
    super(message, { code: 'WALLET_NOT_ACTIVE', details });
    this.name = 'WalletNotActiveError';
  }
}

export class WalletFrozenError extends AuthorizationError {
  constructor(message = 'Wallet is frozen and cannot perform this operation') {
    super(message, { code: 'WALLET_FROZEN' });
    this.name = 'WalletFrozenError';
  }
}

export class InsufficientBalanceError extends ConflictError {
  constructor(message = 'Insufficient wallet balance', details = {}) {
    super(message, { code: 'INSUFFICIENT_BALANCE', details });
    this.name = 'InsufficientBalanceError';
  }
}

export class InvalidTransactionAmountError extends ValidationError {
  constructor(message = 'Transaction amount is invalid', details = {}) {
    super(message, { code: 'INVALID_TRANSACTION_AMOUNT', details });
    this.name = 'InvalidTransactionAmountError';
  }
}

export class LedgerEntryNotFoundError extends NotFoundError {
  constructor(message = 'Ledger entry not found', details = {}) {
    super(message, { code: 'LEDGER_ENTRY_NOT_FOUND', details });
    this.name = 'LedgerEntryNotFoundError';
  }
}

export class LedgerEntryAlreadyReversedError extends ConflictError {
  constructor(message = 'Ledger entry has already been reversed') {
    super(message, { code: 'LEDGER_ENTRY_ALREADY_REVERSED' });
    this.name = 'LedgerEntryAlreadyReversedError';
  }
}

export class LedgerIntegrityError extends Error {
  constructor(message = 'Ledger integrity check failed', details = {}) {
    super(message);
    this.name = 'LedgerIntegrityError';
    this.code = 'LEDGER_INTEGRITY_ERROR';
    this.details = details;
  }
}

export class BalanceCalculationError extends Error {
  constructor(message = 'Balance calculation failed', details = {}) {
    super(message);
    this.name = 'BalanceCalculationError';
    this.code = 'BALANCE_CALCULATION_ERROR';
    this.details = details;
  }
}