/**
 * Document Validators
 *
 * @module signalforge/server/modules/kyc/documents/validator
 */

import { validateDocumentUploadPayload, validateSelfieUploadPayload } from '../kyc.validator.js';

export function validateUploadDocument(body, file) {
  return validateDocumentUploadPayload(body, file);
}

export function validateUploadSelfie(file) {
  return validateSelfieUploadPayload(file);
}