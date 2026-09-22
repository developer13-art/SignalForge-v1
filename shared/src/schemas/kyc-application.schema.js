/**
 * KYC Application Schema
 *
 * Defines the structure of a KYC application submitted by a user.
 *
 * @module @signalforge/shared/schemas/kyc-application
 */

import { KYC_STATUS_VALUES } from '../constants/kyc-statuses.js';
import { KYC_DOCUMENT_TYPE_VALUES } from '../constants/kyc-document-types.js';

export const KYC_APPLICATION_SCHEMA = Object.freeze({
  type: 'object',
  required: [
    'applicationId',
    'userId',
    'status',
    'personalInfo',
    'submittedAt',
  ],
  properties: {
    applicationId: { type: 'string', format: 'uuid' },
    userId: { type: 'string', format: 'uuid' },
    status: { type: 'string', enum: KYC_STATUS_VALUES },
    provider: { type: 'string', nullable: true, maxLength: 64 },
    providerReference: { type: 'string', nullable: true, maxLength: 128 },
    personalInfo: {
      type: 'object',
      required: ['firstName', 'lastName', 'dateOfBirth', 'nationality', 'country'],
      properties: {
        firstName: { type: 'string', minLength: 1, maxLength: 128 },
        middleName: { type: 'string', nullable: true, maxLength: 128 },
        lastName: { type: 'string', minLength: 1, maxLength: 128 },
        dateOfBirth: { type: 'string', format: 'date' },
        nationality: { type: 'string', minLength: 2, maxLength: 3 },
        country: { type: 'string', minLength: 2, maxLength: 3 },
        address: { type: 'string', nullable: true, maxLength: 512 },
        city: { type: 'string', nullable: true, maxLength: 128 },
        state: { type: 'string', nullable: true, maxLength: 128 },
        postalCode: { type: 'string', nullable: true, maxLength: 32 },
        phoneNumber: { type: 'string', nullable: true, maxLength: 32 },
      },
    },
    documentType: { type: 'string', enum: KYC_DOCUMENT_TYPE_VALUES, nullable: true },
    documents: {
      type: 'array',
      items: {
        type: 'object',
        required: ['documentId', 'type', 'storageKey'],
        properties: {
          documentId: { type: 'string', format: 'uuid' },
          type: { type: 'string', enum: KYC_DOCUMENT_TYPE_VALUES },
          storageKey: { type: 'string' },
          mimeType: { type: 'string' },
          sizeBytes: { type: 'number', minimum: 0 },
          uploadedAt: { type: 'string', format: 'date-time' },
        },
      },
      default: [],
    },
    selfie: {
      type: 'object',
      nullable: true,
      properties: {
        documentId: { type: 'string', format: 'uuid' },
        storageKey: { type: 'string' },
        livenessScore: { type: 'number', nullable: true, minimum: 0, maximum: 1 },
        uploadedAt: { type: 'string', format: 'date-time' },
      },
    },
    verifications: {
      type: 'object',
      nullable: true,
      properties: {
        documentCheck: { type: 'boolean', nullable: true },
        identityCheck: { type: 'boolean', nullable: true },
        livenessCheck: { type: 'boolean', nullable: true },
        nameMatch: { type: 'boolean', nullable: true },
        dobMatch: { type: 'boolean', nullable: true },
        riskScore: { type: 'number', nullable: true },
        result: { type: 'string', nullable: true },
      },
    },
    reviewerId: { type: 'string', format: 'uuid', nullable: true },
    rejectionReason: { type: 'string', nullable: true, maxLength: 1024 },
    reviewNotes: { type: 'string', nullable: true, maxLength: 2048 },
    submittedAt: { type: 'string', format: 'date-time' },
    reviewedAt: { type: 'string', format: 'date-time', nullable: true },
    verifiedAt: { type: 'string', format: 'date-time', nullable: true },
    expiresAt: { type: 'string', format: 'date-time', nullable: true },
    metadata: { type: 'object', nullable: true },
  },
  additionalProperties: false,
});

export function buildKycApplication(input) {
  return {
    applicationId: input.applicationId,
    userId: input.userId,
    status: input.status,
    provider: input.provider || null,
    providerReference: input.providerReference || null,
    personalInfo: input.personalInfo,
    documentType: input.documentType || null,
    documents: input.documents || [],
    selfie: input.selfie || null,
    verifications: input.verifications || null,
    reviewerId: input.reviewerId || null,
    rejectionReason: input.rejectionReason || null,
    reviewNotes: input.reviewNotes || null,
    submittedAt: input.submittedAt || new Date().toISOString(),
    reviewedAt: input.reviewedAt || null,
    verifiedAt: input.verifiedAt || null,
    expiresAt: input.expiresAt || null,
    metadata: input.metadata || null,
  };
}

export function validateKycApplication(application) {
  const errors = [];

  if (!application || typeof application !== 'object') {
    return { valid: false, errors: ['KYC application must be an object'] };
  }

  for (const field of KYC_APPLICATION_SCHEMA.required) {
    if (application[field] === undefined || application[field] === null) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  if (application.status && !KYC_STATUS_VALUES.includes(application.status)) {
    errors.push(`Invalid status: ${application.status}`);
  }

  if (application.personalInfo) {
    const required = ['firstName', 'lastName', 'dateOfBirth', 'nationality', 'country'];
    for (const field of required) {
      if (!application.personalInfo[field]) {
        errors.push(`Missing personalInfo.${field}`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

export const KYC_APPLICATION_FIELDS = Object.freeze(
  Object.keys(KYC_APPLICATION_SCHEMA.properties),
);