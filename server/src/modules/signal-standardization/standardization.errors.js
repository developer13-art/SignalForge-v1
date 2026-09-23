/**
 * Signal Standardization Errors
 *
 * @module signalforge/server/modules/signal-standardization/errors
 */

import { NotFoundError } from '../../lib/errors/not-found-error.js';
import { ValidationError } from '../../lib/errors/validation-error.js';
import { ConflictError } from '../../lib/errors/conflict-error.js';

export class StandardizationNotFoundError extends NotFoundError {
  constructor(message = 'Standardized signal not found', details = {}) {
    super(message, { code: 'STANDARDIZATION_NOT_FOUND', details });
    this.name = 'StandardizationNotFoundError';
  }
}

export class StandardizationFailedError extends Error {
  constructor(message = 'Signal standardization failed', details = {}) {
    super(message);
    this.name = 'StandardizationFailedError';
    this.code = 'STANDARDIZATION_FAILED';
    this.details = details;
  }
}

export class StandardizationInvalidInputError extends ValidationError {
  constructor(message = 'Signal input is invalid', details = {}) {
    super(message, { code: 'STANDARDIZATION_INVALID_INPUT', details });
    this.name = 'StandardizationInvalidInputError';
  }
}

export class FingerprintComputationError extends Error {
  constructor(message = 'Fingerprint computation failed', details = {}) {
    super(message);
    this.name = 'FingerprintComputationError';
    this.code = 'FINGERPRINT_COMPUTATION_FAILED';
    this.details = details;
  }
}

export class DuplicateFingerprintError extends ConflictError {
  constructor(message = 'Duplicate signal fingerprint detected', details = {}) {
    super(message, { code: 'DUPLICATE_FINGERPRINT', details });
    this.name = 'DuplicateFingerprintError';
  }
}

export class CanonicalFormError extends ValidationError {
  constructor(message = 'Failed to build canonical form', details = {}) {
    super(message, { code: 'CANONICAL_FORM_FAILED', details });
    this.name = 'CanonicalFormError';
  }
}