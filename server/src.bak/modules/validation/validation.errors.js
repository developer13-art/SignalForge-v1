/**
 * Signal Validation Errors
 *
 * @module signalforge/server/modules/validation/errors
 */

import { NotFoundError } from '../../lib/errors/not-found-error.js';
import { ValidationError } from '../../lib/errors/validation-error.js';
import { ConflictError } from '../../lib/errors/conflict-error.js';

export class ValidationRecordNotFoundError extends NotFoundError {
  constructor(message = 'Validation record not found', details = {}) {
    super(message, { code: 'VALIDATION_RECORD_NOT_FOUND', details });
    this.name = 'ValidationRecordNotFoundError';
  }
}

export class SignalValidationFailedError extends ValidationError {
  constructor(message = 'Signal validation failed', details = {}) {
    super(message, { code: 'SIGNAL_VALIDATION_FAILED', details });
    this.name = 'SignalValidationFailedError';
  }
}

export class DuplicateSignalError extends ConflictError {
  constructor(message = 'Duplicate signal detected', details = {}) {
    super(message, { code: 'DUPLICATE_SIGNAL', details });
    this.name = 'DuplicateSignalError';
  }
}

export class ConflictingSignalError extends ConflictError {
  constructor(message = 'Conflicting signal detected', details = {}) {
    super(message, { code: 'CONFLICTING_SIGNAL', details });
    this.name = 'ConflictingSignalError';
  }
}

export class SignalExpiredError extends ValidationError {
  constructor(message = 'Signal has expired', details = {}) {
    super(message, { code: 'SIGNAL_EXPIRED', details });
    this.name = 'SignalExpiredError';
  }
}

export class MarketClosedError extends ValidationError {
  constructor(message = 'Market is closed for this symbol', details = {}) {
    super(message, { code: 'MARKET_CLOSED', details });
    this.name = 'MarketClosedError';
  }
}

export class SourceNotTrustedError extends ValidationError {
  constructor(message = 'Signal source is not trusted enough', details = {}) {
    super(message, { code: 'SOURCE_NOT_TRUSTED', details });
    this.name = 'SourceNotTrustedError';
  }
}

export class ValidationCheckError extends Error {
  constructor(message = 'Validation check failed', details = {}) {
    super(message);
    this.name = 'ValidationCheckError';
    this.code = 'VALIDATION_CHECK_ERROR';
    this.details = details;
  }
}