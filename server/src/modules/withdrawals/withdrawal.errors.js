/**
 * Withdrawals Module Errors
 *
 * @module signalforge/server/modules/withdrawals/errors
 */
const { NotFoundError } = require('../../lib/errors/not-found-error.js');
const { ValidationError } = require('../../lib/errors/validation-error.js');
const { ConflictError } = require('../../lib/errors/conflict-error.js');
const { AuthorizationError } = require('../../lib/errors/authorization-error.js');
class WithdrawalNotFoundError extends NotFoundError {
  constructor(message = 'Withdrawal request not found', details = {}) {
    super(message, { code: 'WITHDRAWAL_NOT_FOUND', details });
    this.name = 'WithdrawalNotFoundError';
  }
}
class WithdrawalAccountNotFoundError extends NotFoundError {
  constructor(message = 'Withdrawal account not found', details = {}) {
    super(message, { code: 'WITHDRAWAL_ACCOUNT_NOT_FOUND', details });
    this.name = 'WithdrawalAccountNotFoundError';
  }
}
class WithdrawalAccountNotVerifiedError extends AuthorizationError {
  constructor(message = 'Withdrawal account is not verified') {
    super(message, { code: 'WITHDRAWAL_ACCOUNT_NOT_VERIFIED' });
    this.name = 'WithdrawalAccountNotVerifiedError';
  }
}
class InsufficientWithdrawableBalanceError extends ConflictError {
  constructor(message = 'Insufficient withdrawable balance', details = {}) {
    super(message, { code: 'INSUFFICIENT_WITHDRAWABLE_BALANCE', details });
    this.name = 'InsufficientWithdrawableBalanceError';
  }
}
class WithdrawalBelowMinimumError extends ValidationError {
  constructor(message = 'Withdrawal amount is below the minimum', details = {}) {
    super(message, { code: 'WITHDRAWAL_BELOW_MINIMUM', details });
    this.name = 'WithdrawalBelowMinimumError';
  }
}
class WithdrawalAboveMaximumError extends ValidationError {
  constructor(message = 'Withdrawal amount exceeds the maximum', details = {}) {
    super(message, { code: 'WITHDRAWAL_ABOVE_MAXIMUM', details });
    this.name = 'WithdrawalAboveMaximumError';
  }
}
class WithdrawalLimitExceededError extends AuthorizationError {
  constructor(message = 'Withdrawal limit exceeded', details = {}) {
    super(message, { code: 'WITHDRAWAL_LIMIT_EXCEEDED', details });
    this.name = 'WithdrawalLimitExceededError';
  }
}
class WithdrawalNotCancellableError extends ConflictError {
  constructor(message = 'Withdrawal request cannot be cancelled in its current state', details = {}) {
    super(message, { code: 'WITHDRAWAL_NOT_CANCELLABLE', details });
    this.name = 'WithdrawalNotCancellableError';
  }
}
class WithdrawalAlreadyDecidedError extends ConflictError {
  constructor(message = 'Withdrawal request has already been decided') {
    super(message, { code: 'WITHDRAWAL_ALREADY_DECIDED' });
    this.name = 'WithdrawalAlreadyDecidedError';
  }
}
class InvalidWithdrawalPayloadError extends ValidationError {
  constructor(message = 'Withdrawal payload is invalid', details = {}) {
    super(message, { code: 'INVALID_WITHDRAWAL_PAYLOAD', details });
    this.name = 'InvalidWithdrawalPayloadError';
  }
}
class WithdrawalMethodNotSupportedError extends ValidationError {
  constructor(message = 'Withdrawal method is not supported', details = {}) {
    super(message, { code: 'WITHDRAWAL_METHOD_NOT_SUPPORTED', details });
    this.name = 'WithdrawalMethodNotSupportedError';
  }
}
class WithdrawalProcessingError extends Error {
  constructor(message = 'Withdrawal processing failed', details = {}) {
    super(message);
    this.name = 'WithdrawalProcessingError';
    this.code = 'WITHDRAWAL_PROCESSING_FAILED';
    this.details = details;
  }
}
class KycRequiredForWithdrawalError extends AuthorizationError {
  constructor(message = 'KYC verification is required to withdraw funds') {
    super(message, { code: 'KYC_REQUIRED', statusCode: 403 });
    this.name = 'KycRequiredForWithdrawalError';
  }
}
module.exports.WithdrawalNotFoundError = WithdrawalNotFoundError;
module.exports.WithdrawalAccountNotFoundError = WithdrawalAccountNotFoundError;
module.exports.WithdrawalAccountNotVerifiedError = WithdrawalAccountNotVerifiedError;
module.exports.InsufficientWithdrawableBalanceError = InsufficientWithdrawableBalanceError;
module.exports.WithdrawalBelowMinimumError = WithdrawalBelowMinimumError;
module.exports.WithdrawalAboveMaximumError = WithdrawalAboveMaximumError;
module.exports.WithdrawalLimitExceededError = WithdrawalLimitExceededError;
module.exports.WithdrawalNotCancellableError = WithdrawalNotCancellableError;
module.exports.WithdrawalAlreadyDecidedError = WithdrawalAlreadyDecidedError;
module.exports.InvalidWithdrawalPayloadError = InvalidWithdrawalPayloadError;
module.exports.WithdrawalMethodNotSupportedError = WithdrawalMethodNotSupportedError;
module.exports.WithdrawalProcessingError = WithdrawalProcessingError;
module.exports.KycRequiredForWithdrawalError = KycRequiredForWithdrawalError;
