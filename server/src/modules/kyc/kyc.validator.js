/**
 * KYC Validators
 *
 * @module signalforge/server/modules/kyc/validator
 */

import { isValidEmail } from '@signalforge/shared/validators/email.validator';
import { KYC_DOCUMENT_TYPES, ALLOWED_DOCUMENT_MIME_TYPES, ALLOWED_SELFIE_MIME_TYPES } from './kyc.constants.js';

const COUNTRY_PATTERN = /^[A-Z]{2,3}$/;

export function validatePersonalInfoPayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (!body.firstName || typeof body.firstName !== 'string') {
    errors.push('First name is required');
  } else if (body.firstName.length > 128) {
    errors.push('First name must not exceed 128 characters');
  }

  if (body.middleName !== undefined && body.middleName !== null) {
    if (typeof body.middleName !== 'string' || body.middleName.length > 128) {
      errors.push('Middle name must not exceed 128 characters');
    }
  }

  if (!body.lastName || typeof body.lastName !== 'string') {
    errors.push('Last name is required');
  } else if (body.lastName.length > 128) {
    errors.push('Last name must not exceed 128 characters');
  }

  if (!body.dateOfBirth || typeof body.dateOfBirth !== 'string') {
    errors.push('Date of birth is required');
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(body.dateOfBirth)) {
    errors.push('Date of birth must be in YYYY-MM-DD format');
  } else {
    const age = (Date.now() - new Date(body.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    if (age < 18) {
      errors.push('You must be at least 18 years old');
    }
    if (age > 120) {
      errors.push('Date of birth is not valid');
    }
  }

  if (!body.nationality || typeof body.nationality !== 'string') {
    errors.push('Nationality is required');
  } else if (!COUNTRY_PATTERN.test(body.nationality)) {
    errors.push('Nationality must be a valid country code');
  }

  if (!body.country || typeof body.country !== 'string') {
    errors.push('Country of residence is required');
  } else if (!COUNTRY_PATTERN.test(body.country)) {
    errors.push('Country of residence must be a valid country code');
  }

  if (body.address !== undefined && body.address !== null) {
    if (typeof body.address !== 'string' || body.address.length > 512) {
      errors.push('Address must not exceed 512 characters');
    }
  }

  if (body.city !== undefined && body.city !== null) {
    if (typeof body.city !== 'string' || body.city.length > 128) {
      errors.push('City must not exceed 128 characters');
    }
  }

  if (body.state !== undefined && body.state !== null) {
    if (typeof body.state !== 'string' || body.state.length > 128) {
      errors.push('State must not exceed 128 characters');
    }
  }

  if (body.postalCode !== undefined && body.postalCode !== null) {
    if (typeof body.postalCode !== 'string' || body.postalCode.length > 32) {
      errors.push('Postal code must not exceed 32 characters');
    }
  }

  if (body.phoneNumber !== undefined && body.phoneNumber !== null) {
    if (typeof body.phoneNumber !== 'string' || body.phoneNumber.length > 32) {
      errors.push('Phone number must not exceed 32 characters');
    }
  }

  if (body.email !== undefined && body.email !== null) {
    if (!isValidEmail(body.email)) {
      errors.push('Email is invalid');
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateDocumentUploadPayload(body, file) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (!body.documentType || typeof body.documentType !== 'string') {
    errors.push('Document type is required');
  } else if (!Object.values(KYC_DOCUMENT_TYPES).includes(body.documentType)) {
    errors.push('Document type is not supported');
  }

  if (!file) {
    errors.push('Document file is required');
  } else {
    if (!ALLOWED_DOCUMENT_MIME_TYPES.includes(file.mimetype)) {
      errors.push(`Document format must be one of: ${ALLOWED_DOCUMENT_MIME_TYPES.join(', ')}`);
    }
    const maxSizeMb = 10;
    if (file.size && file.size > maxSizeMb * 1024 * 1024) {
      errors.push(`Document must not exceed ${maxSizeMb} MB`);
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateSelfieUploadPayload(file) {
  const errors = [];

  if (!file) {
    return { valid: false, errors: ['Selfie file is required'] };
  }

  if (!ALLOWED_SELFIE_MIME_TYPES.includes(file.mimetype)) {
    errors.push(`Selfie format must be one of: ${ALLOWED_SELFIE_MIME_TYPES.join(', ')}`);
  }

  const maxSizeMb = 5;
  if (file.size && file.size > maxSizeMb * 1024 * 1024) {
    errors.push(`Selfie must not exceed ${maxSizeMb} MB`);
  }

  return { valid: errors.length === 0, errors };
}

export function validateReviewDecisionPayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (!body.decision || typeof body.decision !== 'string') {
    errors.push('Decision is required');
  } else if (!['APPROVE', 'REJECT', 'REQUEST_RESUBMISSION'].includes(body.decision)) {
    errors.push('Decision must be APPROVE, REJECT, or REQUEST_RESUBMISSION');
  }

  if (body.decision === 'REJECT' && (!body.reason || typeof body.reason !== 'string')) {
    errors.push('A rejection reason is required');
  }

  if (body.decision === 'REQUEST_RESUBMISSION' && (!body.reason || typeof body.reason !== 'string')) {
    errors.push('A resubmission reason is required');
  }

  if (body.reason !== undefined && typeof body.reason !== 'string') {
    errors.push('Reason must be a string');
  }

  if (body.reason && body.reason.length > 1024) {
    errors.push('Reason must not exceed 1024 characters');
  }

  if (body.notes !== undefined && typeof body.notes !== 'string') {
    errors.push('Notes must be a string');
  }

  if (body.notes && body.notes.length > 2048) {
    errors.push('Notes must not exceed 2048 characters');
  }

  return { valid: errors.length === 0, errors };
}