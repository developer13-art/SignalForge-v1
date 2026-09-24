/**
 * Withdrawals Module Errors
 *
 * @module signalforge/server/modules/withdrawals/errors
 */

import { NotFoundError } from '../../lib/errors/not-found-error.js';
import { ValidationError } from '../../lib/errors/validation-error.js';
import { ConflictError } from '../../lib/errors/conflict-error.js';
import { AuthorizationError } from '../../lib/errors/authorization-error.js';

export class WithdrawalNotFoundError extends NotFoundError {
  constructor(message = 'Withdrawal request not found', details = {}) {
    super(message, { code: 'WITHDRAWAL_NOT_FOUND', details });
    this.name = 'WithdrawalNotFoundError';
  }
}

export class WithdrawalAccountNotFoundError extends NotFoundError {
  constructor(message = 'Withdrawal account not found', details = {}) {
    super(message, { code: 'WITHDRAWAL_ACCOUNT_NOT_FOUND', details });
    this.name = 'WithdrawalAccountNotFoundError';
  }
}

export class WithdrawalAccountNotVerifiedError extends AuthorizationError {
  constructor(message = 'Withdrawal account is not verified') {
    super(message, { code: 'WITHDRAWAL_ACCOUNT_NOT_VERIFIED' });
    this.name = 'WithdrawalAccountNotVerifiedError';
  }
}

export class InsufficientWithdrawableBalanceError extends ConflictError {
  constructor(message = 'Insufficient withdrawable balance', details = {}) {
    super(message, { code: 'INSUFFICIENT_WITHDRAWABLE_BALANCE', details });
    this.name = 'InsufficientWithdrawableBalanceError';
  }
}

export class WithdrawalBelowMinimumError extends ValidationError {
  constructor(message = 'Withdrawal amount is below the minimum', details = {}) {
    super(message, { code: 'WITHDRAWAL_BELOW_MINIMUM', details });
    this.name = 'WithdrawalBelowMinimumError';
  }
}

export class WithdrawalAboveMaximumError extends ValidationError {
  constructor(message = 'Withdrawal amount exceeds the maximum', details = {}) {
    super(message, { code: 'WITHDRAWAL_ABOVE_MAXIMUM', details });
    this.name = 'WithdrawalAboveMaximumError';
  }
}

export class WithdrawalLimitExceededError extends AuthorizationError {
  constructor(message = 'Withdrawal limit exceeded', details = {}) {
    super(message, { code: 'WITHDRAWAL_LIMIT_EXCEEDED', details });
    this.name = 'WithdrawalLimitExceededError';
  }
}

export class WithdrawalNotCancellableError extends ConflictError {
  constructor(message = 'Withdrawal request cannot be cancelled in its current state', details = {}) {
    super(message, { code: 'WITHDRAWAL_NOT_CANCELLABLE', details });
    this.name = 'WithdrawalNotCancellableError';
  }
}

export class WithdrawalAlreadyDecidedError extends ConflictError {
  constructor(message = 'Withdrawal request has already been decided') {
    super(message, { code: 'WITHDRAWAL_ALREADY_DECIDED' });
    this.name = 'WithdrawalAlreadyDecidedError';
  }
}

export class InvalidWithdrawalPayloadError extends ValidationError {
  constructor(message = 'Withdrawal payload is invalid', details = {}) {
    super(message, { code: 'INVALID_WITHDRAWAL_PAYLOAD', details });
    this.name = 'InvalidWithdrawalPayloadError';
  }
}

export class WithdrawalMethodNotSupportedError extends ValidationError {
  constructor(message = 'Withdrawal method is not supported', details = {}) {
    super(message, { code: 'WITHDRAWAL_METHOD_NOT_SUPPORTED', details });
    this.name = 'WithdrawalMethodNotSupportedError';
  }
}

export class WithdrawalProcessingError extends Error {
  constructor(message = 'Withdrawal processing failed', details = {}) {
    super(message);
    this.name = 'WithdrawalProcessingError';
    this.code = 'WITHDRAWAL_PROCESSING_FAILED';
    this.details = details;
  }
}

export class KycRequiredForWithdrawalError extends AuthorizationError {
  constructor(message = 'KYC verification is required to withdraw funds') {
    super(message, { code: 'KYC_REQUIRED', statusCode: 403 });
    this.name = 'KycRequiredForWithdrawalError';
  }
}