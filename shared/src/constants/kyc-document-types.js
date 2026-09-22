/**
 * KYC Document Types
 *
 * Defines the default identity document types supported by SignalForge.
 * These are initial values seeded into the `kyc_document_types` table.
 * Administrators can add, edit, or deactivate document types at runtime
 * without a code deployment.
 *
 * @module @signalforge/shared/constants/kyc-document-types
 */

export const KYC_DOCUMENT_TYPES = Object.freeze({
  NATIONAL_ID: 'NATIONAL_ID',
  VOTERS_CARD: 'VOTERS_CARD',
  DRIVERS_LICENSE: 'DRIVERS_LICENSE',
  INTERNATIONAL_PASSPORT: 'INTERNATIONAL_PASSPORT',
  RESIDENCE_PERMIT: 'RESIDENCE_PERMIT',
  OTHER: 'OTHER',
});

export const KYC_DOCUMENT_TYPE_VALUES = Object.freeze(Object.values(KYC_DOCUMENT_TYPES));

export const KYC_DOCUMENT_TYPE_LABELS = Object.freeze({
  [KYC_DOCUMENT_TYPES.NATIONAL_ID]: 'National Identity Card',
  [KYC_DOCUMENT_TYPES.VOTERS_CARD]: "Voter's Card",
  [KYC_DOCUMENT_TYPES.DRIVERS_LICENSE]: "Driver's License",
  [KYC_DOCUMENT_TYPES.INTERNATIONAL_PASSPORT]: 'International Passport',
  [KYC_DOCUMENT_TYPES.RESIDENCE_PERMIT]: 'Residence Permit',
  [KYC_DOCUMENT_TYPES.OTHER]: 'Other Approved Identity Document',
});

export const KYC_DOCUMENT_TYPE_DESCRIPTIONS = Object.freeze({
  [KYC_DOCUMENT_TYPES.NATIONAL_ID]: 'Government-issued national identity card.',
  [KYC_DOCUMENT_TYPES.VOTERS_CARD]: 'Government-issued voter registration card.',
  [KYC_DOCUMENT_TYPES.DRIVERS_LICENSE]: 'Government-issued driver license.',
  [KYC_DOCUMENT_TYPES.INTERNATIONAL_PASSPORT]: 'Government-issued international passport.',
  [KYC_DOCUMENT_TYPES.RESIDENCE_PERMIT]: 'Government-issued residence permit.',
  [KYC_DOCUMENT_TYPES.OTHER]: 'Any other identity document approved by the compliance team.',
});

export const KYC_DOCUMENT_FILE_FORMATS = Object.freeze([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'application/pdf',
]);

export const KYC_DOCUMENT_MAX_FILE_SIZE_MB = 10;

export const KYC_SELFIE_FILE_FORMATS = Object.freeze([
  'image/jpeg',
  'image/jpg',
  'image/png',
]);

export const KYC_SELFIE_MAX_FILE_SIZE_MB = 5;

export function isValidDocumentType(type) {
  return KYC_DOCUMENT_TYPE_VALUES.includes(type);
}

export function isValidDocumentFormat(mimeType) {
  return KYC_DOCUMENT_FILE_FORMATS.includes(mimeType);
}

export function isValidSelfieFormat(mimeType) {
  return KYC_SELFIE_FILE_FORMATS.includes(mimeType);
}