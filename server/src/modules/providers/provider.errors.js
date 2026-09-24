/**
 * Providers Module Errors
 *
 * @module signalforge/server/modules/providers/errors
 */

import { NotFoundError } from '../../lib/errors/not-found-error.js';
import { ValidationError } from '../../lib/errors/validation-error.js';
import { ConflictError } from '../../lib/errors/conflict-error.js';
import { AuthorizationError } from '../../lib/errors/authorization-error.js';

export class ProviderNotFoundError extends NotFoundError {
  constructor(message = 'Provider not found', details = {}) {
    super(message, { code: 'PROVIDER_NOT_FOUND', details });
    this.name = 'ProviderNotFoundError';
  }
}

export class ProviderProfileNotFoundError extends NotFoundError {
  constructor(message = 'Provider profile not found', details = {}) {
    super(message, { code: 'PROVIDER_PROFILE_NOT_FOUND', details });
    this.name = 'ProviderProfileNotFoundError';
  }
}

export class ProviderAlreadyRegisteredError extends ConflictError {
  constructor(message = 'Provider is already registered for this user') {
    super(message, { code: 'PROVIDER_ALREADY_REGISTERED' });
    this.name = 'ProviderAlreadyRegisteredError';
  }
}

export class ProviderNotActiveError extends AuthorizationError {
  constructor(message = 'Provider is not active', details = {}) {
    super(message, { code: 'PROVIDER_NOT_ACTIVE', details });
    this.name = 'ProviderNotActiveError';
  }
}

export class ProviderNotOwnedError extends AuthorizationError {
  constructor(message = 'Provider does not belong to this user') {
    super(message, { code: 'PROVIDER_NOT_OWNED' });
    this.name = 'ProviderNotOwnedError';
  }
}

export class CertificationNotFoundError extends NotFoundError {
  constructor(message = 'Certification not found', details = {}) {
    super(message, { code: 'CERTIFICATION_NOT_FOUND', details });
    this.name = 'CertificationNotFoundError';
  }
}

export class CertificationAlreadyRunningError extends ConflictError {
  constructor(message = 'A certification run is already in progress for this provider') {
    super(message, { code: 'CERTIFICATION_ALREADY_RUNNING' });
    this.name = 'CertificationAlreadyRunningError';
  }
}

export class CertificationFailedError extends Error {
  constructor(message = 'Provider certification failed', details = {}) {
    super(message);
    this.name = 'CertificationFailedError';
    this.code = 'CERTIFICATION_FAILED';
    this.details = details;
  }
}

export class InsufficientHistoricalDataError extends ValidationError {
  constructor(message = 'Insufficient historical data for certification', details = {}) {
    super(message, { code: 'INSUFFICIENT_HISTORICAL_DATA', details });
    this.name = 'InsufficientHistoricalDataError';
  }
}

export class InvalidProviderPayloadError extends ValidationError {
  constructor(message = 'Provider payload is invalid', details = {}) {
    super(message, { code: 'INVALID_PROVIDER_PAYLOAD', details });
    this.name = 'InvalidProviderPayloadError';
  }
}

export class PromotionNotFoundError extends NotFoundError {
  constructor(message = 'Promotion not found', details = {}) {
    super(message, { code: 'PROMOTION_NOT_FOUND', details });
    this.name = 'PromotionNotFoundError';
  }
}

export class PromotionNotEditableError extends ConflictError {
  constructor(message = 'Promotion cannot be edited in its current state', details = {}) {
    super(message, { code: 'PROMOTION_NOT_EDITABLE', details });
    this.name = 'PromotionNotEditableError';
  }
}

export class ProviderCertificationRequiredError extends AuthorizationError {
  constructor(message = 'Provider must be certified to perform this action') {
    super(message, { code: 'PROVIDER_CERTIFICATION_REQUIRED' });
    this.name = 'ProviderCertificationRequiredError';
  }
}