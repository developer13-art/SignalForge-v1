/**
 * Signal Validation Errors
 *
 * @module signalforge/server/modules/validation/errors
 */
const { NotFoundError } = require('../../lib/errors/not-found-error.js');
const { ValidationError } = require('../../lib/errors/validation-error.js');
const { ConflictError } = require('../../lib/errors/conflict-error.js');
class ValidationRecordNotFoundError extends NotFoundError {
  constructor(message = 'Validation record not found', details = {}) {
    super(message, { code: 'VALIDATION_RECORD_NOT_FOUND', details });
    this.name = 'ValidationRecordNotFoundError';
  }
}
class SignalValidationFailedError extends ValidationError {
  constructor(message = 'Signal validation failed', details = {}) {
    super(message, { code: 'SIGNAL_VALIDATION_FAILED', details });
    this.name = 'SignalValidationFailedError';
  }
}
class DuplicateSignalError extends ConflictError {
  constructor(message = 'Duplicate signal detected', details = {}) {
    super(message, { code: 'DUPLICATE_SIGNAL', details });
    this.name = 'DuplicateSignalError';
  }
}
class ConflictingSignalError extends ConflictError {
  constructor(message = 'Conflicting signal detected', details = {}) {
    super(message, { code: 'CONFLICTING_SIGNAL', details });
    this.name = 'ConflictingSignalError';
  }
}
class SignalExpiredError extends ValidationError {
  constructor(message = 'Signal has expired', details = {}) {
    super(message, { code: 'SIGNAL_EXPIRED', details });
    this.name = 'SignalExpiredError';
  }
}
class MarketClosedError extends ValidationError {
  constructor(message = 'Market is closed for this symbol', details = {}) {
    super(message, { code: 'MARKET_CLOSED', details });
    this.name = 'MarketClosedError';
  }
}
class SourceNotTrustedError extends ValidationError {
  constructor(message = 'Signal source is not trusted enough', details = {}) {
    super(message, { code: 'SOURCE_NOT_TRUSTED', details });
    this.name = 'SourceNotTrustedError';
  }
}
class ValidationCheckError extends Error {
  constructor(message = 'Validation check failed', details = {}) {
    super(message);
    this.name = 'ValidationCheckError';
    this.code = 'VALIDATION_CHECK_ERROR';
    this.details = details;
  }
}
module.exports.ValidationRecordNotFoundError = ValidationRecordNotFoundError;
module.exports.SignalValidationFailedError = SignalValidationFailedError;
module.exports.DuplicateSignalError = DuplicateSignalError;
module.exports.ConflictingSignalError = ConflictingSignalError;
module.exports.SignalExpiredError = SignalExpiredError;
module.exports.MarketClosedError = MarketClosedError;
module.exports.SourceNotTrustedError = SourceNotTrustedError;
module.exports.ValidationCheckError = ValidationCheckError;
