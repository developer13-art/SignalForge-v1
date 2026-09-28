/**
 * KYC Module Errors
 *
 * @module signalforge/server/modules/kyc/errors
 */

import { NotFoundError } from '../../lib/errors/not-found-error.js';
import { ConflictError } from '../../lib/errors/conflict-error.js';
import { ValidationError } from '../../lib/errors/validation-error.js';
import { AuthorizationError } from '../../lib/errors/authorization-error.js';

export class KycApplicationNotFoundError extends NotFoundError {
  constructor(message = 'KYC application not found', details = {}) {
    super(message, { code: 'KYC_APPLICATION_NOT_FOUND', details });
    this.name = 'KycApplicationNotFoundError';
  }
}

export class KycDocumentNotFoundError extends NotFoundError {
  constructor(message = 'KYC document not found', details = {}) {
    super(message, { code: 'KYC_DOCUMENT_NOT_FOUND', details });
    this.name = 'KycDocumentNotFoundError';
  }
}

export class KycAlreadyVerifiedError extends ConflictError {
  constructor(message = 'KYC is already verified') {
    super(message, { code: 'KYC_ALREADY_VERIFIED' });
    this.name = 'KycAlreadyVerifiedError';
  }
}

export class KycApplicationAlreadyExistsError extends ConflictError {
  constructor(message = 'An active KYC application already exists') {
    super(message, { code: 'KYC_APPLICATION_ALREADY_EXISTS' });
    this.name = 'KycApplicationAlreadyExistsError';
  }
}

export class KycApplicationNotSubmittableError extends ConflictError {
  constructor(message = 'KYC application cannot be submitted in its current state', details = {}) {
    super(message, { code: 'KYC_APPLICATION_NOT_SUBMITTABLE', details });
    this.name = 'KycApplicationNotSubmittableError';
  }
}

export class KycDocumentTooLargeError extends ValidationError {
  constructor(message = 'Document file is too large', details = {}) {
    super(message, { code: 'KYC_DOCUMENT_TOO_LARGE', details });
    this.name = 'KycDocumentTooLargeError';
  }
}

export class KycInvalidDocumentTypeError extends ValidationError {
  constructor(message = 'Document type is not supported', details = {}) {
    super(message, { code: 'KYC_INVALID_DOCUMENT_TYPE', details });
    this.name = 'KycInvalidDocumentTypeError';
  }
}

export class KycInvalidDocumentFormatError extends ValidationError {
  constructor(message = 'Document format is not supported', details = {}) {
    super(message, { code: 'KYC_INVALID_DOCUMENT_FORMAT', details });
    this.name = 'KycInvalidDocumentFormatError';
  }
}

export class KycDocumentQualityError extends ValidationError {
  constructor(message = 'Document quality check failed', details = {}) {
    super(message, { code: 'KYC_DOCUMENT_QUALITY_FAILED', details });
    this.name = 'KycDocumentQualityError';
  }
}

export class KycDuplicateDocumentError extends ConflictError {
  constructor(message = 'This document has already been uploaded') {
    super(message, { code: 'KYC_DUPLICATE_DOCUMENT' });
    this.name = 'KycDuplicateDocumentError';
  }
}

export class KycSelfieRequiredError extends ValidationError {
  constructor(message = 'A selfie is required for KYC verification') {
    super(message, { code: 'KYC_SELFIE_REQUIRED' });
    this.name = 'KycSelfieRequiredError';
  }
}

export class KycDocumentRequiredError extends ValidationError {
  constructor(message = 'At least one document is required for KYC verification') {
    super(message, { code: 'KYC_DOCUMENT_REQUIRED' });
    this.name = 'KycDocumentRequiredError';
  }
}

export class KycVerificationFailedError extends ValidationError {
  constructor(message = 'KYC verification failed', details = {}) {
    super(message, { code: 'KYC_VERIFICATION_FAILED', details });
    this.name = 'KycVerificationFailedError';
  }
}

export class KycProviderError extends Error {
  constructor(message = 'KYC provider error', details = {}) {
    super(message);
    this.name = 'KycProviderError';
    this.code = 'KYC_PROVIDER_ERROR';
    this.details = details;
  }
}

export class KycProviderNotConfiguredError extends Error {
  constructor(message = 'KYC provider is not configured') {
    super(message);
    this.name = 'KycProviderNotConfiguredError';
    this.code = 'KYC_PROVIDER_NOT_CONFIGURED';
  }
}

export class KycReviewAlreadyDecidedError extends ConflictError {
  constructor(message = 'KYC application has already been decided') {
    super(message, { code: 'KYC_REVIEW_ALREADY_DECIDED' });
    this.name = 'KycReviewAlreadyDecidedError';
  }
}

export class KycFeatureAccessDeniedError extends AuthorizationError {
  constructor(message = 'KYC verification is required to access this feature', details = {}) {
    super(message, { code: 'KYC_REQUIRED', details });
    this.name = 'KycFeatureAccessDeniedError';
  }
}