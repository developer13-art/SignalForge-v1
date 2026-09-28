/**
 * KYC Module Errors
 *
 * @module signalforge/server/modules/kyc/errors
 */
const { NotFoundError } = require('../../lib/errors/not-found-error.js');
const { ConflictError } = require('../../lib/errors/conflict-error.js');
const { ValidationError } = require('../../lib/errors/validation-error.js');
const { AuthorizationError } = require('../../lib/errors/authorization-error.js');
class KycApplicationNotFoundError extends NotFoundError {
  constructor(message = 'KYC application not found', details = {}) {
    super(message, { code: 'KYC_APPLICATION_NOT_FOUND', details });
    this.name = 'KycApplicationNotFoundError';
  }
}
class KycDocumentNotFoundError extends NotFoundError {
  constructor(message = 'KYC document not found', details = {}) {
    super(message, { code: 'KYC_DOCUMENT_NOT_FOUND', details });
    this.name = 'KycDocumentNotFoundError';
  }
}
class KycAlreadyVerifiedError extends ConflictError {
  constructor(message = 'KYC is already verified') {
    super(message, { code: 'KYC_ALREADY_VERIFIED' });
    this.name = 'KycAlreadyVerifiedError';
  }
}
class KycApplicationAlreadyExistsError extends ConflictError {
  constructor(message = 'An active KYC application already exists') {
    super(message, { code: 'KYC_APPLICATION_ALREADY_EXISTS' });
    this.name = 'KycApplicationAlreadyExistsError';
  }
}
class KycApplicationNotSubmittableError extends ConflictError {
  constructor(message = 'KYC application cannot be submitted in its current state', details = {}) {
    super(message, { code: 'KYC_APPLICATION_NOT_SUBMITTABLE', details });
    this.name = 'KycApplicationNotSubmittableError';
  }
}
class KycDocumentTooLargeError extends ValidationError {
  constructor(message = 'Document file is too large', details = {}) {
    super(message, { code: 'KYC_DOCUMENT_TOO_LARGE', details });
    this.name = 'KycDocumentTooLargeError';
  }
}
class KycInvalidDocumentTypeError extends ValidationError {
  constructor(message = 'Document type is not supported', details = {}) {
    super(message, { code: 'KYC_INVALID_DOCUMENT_TYPE', details });
    this.name = 'KycInvalidDocumentTypeError';
  }
}
class KycInvalidDocumentFormatError extends ValidationError {
  constructor(message = 'Document format is not supported', details = {}) {
    super(message, { code: 'KYC_INVALID_DOCUMENT_FORMAT', details });
    this.name = 'KycInvalidDocumentFormatError';
  }
}
class KycDocumentQualityError extends ValidationError {
  constructor(message = 'Document quality check failed', details = {}) {
    super(message, { code: 'KYC_DOCUMENT_QUALITY_FAILED', details });
    this.name = 'KycDocumentQualityError';
  }
}
class KycDuplicateDocumentError extends ConflictError {
  constructor(message = 'This document has already been uploaded') {
    super(message, { code: 'KYC_DUPLICATE_DOCUMENT' });
    this.name = 'KycDuplicateDocumentError';
  }
}
class KycSelfieRequiredError extends ValidationError {
  constructor(message = 'A selfie is required for KYC verification') {
    super(message, { code: 'KYC_SELFIE_REQUIRED' });
    this.name = 'KycSelfieRequiredError';
  }
}
class KycDocumentRequiredError extends ValidationError {
  constructor(message = 'At least one document is required for KYC verification') {
    super(message, { code: 'KYC_DOCUMENT_REQUIRED' });
    this.name = 'KycDocumentRequiredError';
  }
}
class KycVerificationFailedError extends ValidationError {
  constructor(message = 'KYC verification failed', details = {}) {
    super(message, { code: 'KYC_VERIFICATION_FAILED', details });
    this.name = 'KycVerificationFailedError';
  }
}
class KycProviderError extends Error {
  constructor(message = 'KYC provider error', details = {}) {
    super(message);
    this.name = 'KycProviderError';
    this.code = 'KYC_PROVIDER_ERROR';
    this.details = details;
  }
}
class KycProviderNotConfiguredError extends Error {
  constructor(message = 'KYC provider is not configured') {
    super(message);
    this.name = 'KycProviderNotConfiguredError';
    this.code = 'KYC_PROVIDER_NOT_CONFIGURED';
  }
}
class KycReviewAlreadyDecidedError extends ConflictError {
  constructor(message = 'KYC application has already been decided') {
    super(message, { code: 'KYC_REVIEW_ALREADY_DECIDED' });
    this.name = 'KycReviewAlreadyDecidedError';
  }
}
class KycFeatureAccessDeniedError extends AuthorizationError {
  constructor(message = 'KYC verification is required to access this feature', details = {}) {
    super(message, { code: 'KYC_REQUIRED', details });
    this.name = 'KycFeatureAccessDeniedError';
  }
}
module.exports.KycApplicationNotFoundError = KycApplicationNotFoundError;
module.exports.KycDocumentNotFoundError = KycDocumentNotFoundError;
module.exports.KycAlreadyVerifiedError = KycAlreadyVerifiedError;
module.exports.KycApplicationAlreadyExistsError = KycApplicationAlreadyExistsError;
module.exports.KycApplicationNotSubmittableError = KycApplicationNotSubmittableError;
module.exports.KycDocumentTooLargeError = KycDocumentTooLargeError;
module.exports.KycInvalidDocumentTypeError = KycInvalidDocumentTypeError;
module.exports.KycInvalidDocumentFormatError = KycInvalidDocumentFormatError;
module.exports.KycDocumentQualityError = KycDocumentQualityError;
module.exports.KycDuplicateDocumentError = KycDuplicateDocumentError;
module.exports.KycSelfieRequiredError = KycSelfieRequiredError;
module.exports.KycDocumentRequiredError = KycDocumentRequiredError;
module.exports.KycVerificationFailedError = KycVerificationFailedError;
module.exports.KycProviderError = KycProviderError;
module.exports.KycProviderNotConfiguredError = KycProviderNotConfiguredError;
module.exports.KycReviewAlreadyDecidedError = KycReviewAlreadyDecidedError;
module.exports.KycFeatureAccessDeniedError = KycFeatureAccessDeniedError;
