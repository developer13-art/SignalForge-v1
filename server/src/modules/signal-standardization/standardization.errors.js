/**
 * Signal Standardization Errors
 *
 * @module signalforge/server/modules/signal-standardization/errors
 */
const { NotFoundError } = require('../../lib/errors/not-found-error.js');
const { ValidationError } = require('../../lib/errors/validation-error.js');
const { ConflictError } = require('../../lib/errors/conflict-error.js');
class StandardizationNotFoundError extends NotFoundError {
  constructor(message = 'Standardized signal not found', details = {}) {
    super(message, { code: 'STANDARDIZATION_NOT_FOUND', details });
    this.name = 'StandardizationNotFoundError';
  }
}
class StandardizationFailedError extends Error {
  constructor(message = 'Signal standardization failed', details = {}) {
    super(message);
    this.name = 'StandardizationFailedError';
    this.code = 'STANDARDIZATION_FAILED';
    this.details = details;
  }
}
class StandardizationInvalidInputError extends ValidationError {
  constructor(message = 'Signal input is invalid', details = {}) {
    super(message, { code: 'STANDARDIZATION_INVALID_INPUT', details });
    this.name = 'StandardizationInvalidInputError';
  }
}
class FingerprintComputationError extends Error {
  constructor(message = 'Fingerprint computation failed', details = {}) {
    super(message);
    this.name = 'FingerprintComputationError';
    this.code = 'FINGERPRINT_COMPUTATION_FAILED';
    this.details = details;
  }
}
class DuplicateFingerprintError extends ConflictError {
  constructor(message = 'Duplicate signal fingerprint detected', details = {}) {
    super(message, { code: 'DUPLICATE_FINGERPRINT', details });
    this.name = 'DuplicateFingerprintError';
  }
}
class CanonicalFormError extends ValidationError {
  constructor(message = 'Failed to build canonical form', details = {}) {
    super(message, { code: 'CANONICAL_FORM_FAILED', details });
    this.name = 'CanonicalFormError';
  }
}
module.exports.StandardizationNotFoundError = StandardizationNotFoundError;
module.exports.StandardizationFailedError = StandardizationFailedError;
module.exports.StandardizationInvalidInputError = StandardizationInvalidInputError;
module.exports.FingerprintComputationError = FingerprintComputationError;
module.exports.DuplicateFingerprintError = DuplicateFingerprintError;
module.exports.CanonicalFormError = CanonicalFormError;
