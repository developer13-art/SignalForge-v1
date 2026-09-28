/**
 * KYC Module Constants
 *
 * @module signalforge/server/modules/kyc/constants
 */

export const KYC_EVENTS = Object.freeze({
  APPLICATION_CREATED: 'kyc.application.created',
  APPLICATION_SUBMITTED: 'kyc.application.submitted',
  APPLICATION_UPDATED: 'kyc.application.updated',
  DOCUMENT_UPLOADED: 'kyc.document.uploaded',
  DOCUMENT_DELETED: 'kyc.document.deleted',
  DOCUMENT_QUALITY_FAILED: 'kyc.document.quality_failed',
  SELFIE_UPLOADED: 'kyc.selfie.uploaded',
  VERIFICATION_STARTED: 'kyc.verification.started',
  VERIFICATION_COMPLETED: 'kyc.verification.completed',
  VERIFICATION_FAILED: 'kyc.verification.failed',
  APPLICATION_APPROVED: 'kyc.application.approved',
  APPLICATION_REJECTED: 'kyc.application.rejected',
  RESUBMISSION_REQUESTED: 'kyc.resubmission.requested',
  RESUBMISSION_COMPLETED: 'kyc.resubmission.completed',
  KYC_EXPIRED: 'kyc.expired',
  KYC_SUSPENDED: 'kyc.suspended',
  REVERIFICATION_REQUIRED: 'kyc.reverification.required',
  STATUS_CHANGED: 'kyc.status.changed',
});

export const KYC_DOCUMENT_TYPES = Object.freeze({
  NATIONAL_ID: 'NATIONAL_ID',
  VOTERS_CARD: 'VOTERS_CARD',
  DRIVERS_LICENSE: 'DRIVERS_LICENSE',
  INTERNATIONAL_PASSPORT: 'INTERNATIONAL_PASSPORT',
  RESIDENCE_PERMIT: 'RESIDENCE_PERMIT',
  OTHER: 'OTHER',
});

export const KYC_PROVIDERS = Object.freeze({
  SMILE_ID: 'smileid',
  VERIFYME: 'verifyme',
  MANUAL: 'manual',
});

export const VERIFICATION_RESULTS = Object.freeze({
  PASSED: 'PASSED',
  FAILED: 'FAILED',
  INCONCLUSIVE: 'INCONCLUSIVE',
  ERROR: 'ERROR',
});

export const QUALITY_CHECK_RESULTS = Object.freeze({
  PASSED: 'PASSED',
  FAILED: 'FAILED',
  WARNING: 'WARNING',
});

export const DEFAULT_MIN_RESOLUTION = 640;
export const DEFAULT_MAX_FILE_SIZE_MB = 10;
export const DEFAULT_SELFIE_MAX_FILE_SIZE_MB = 5;
export const DEFAULT_LIVENESS_THRESHOLD = 0.8;
export const DEFAULT_NAME_MATCH_THRESHOLD = 0.85;
export const DEFAULT_AUTO_APPROVAL_CONFIDENCE = 0.9;
export const DEFAULT_AUTO_APPROVAL_RISK_SCORE = 0.2;
export const DEFAULT_KYC_EXPIRY_YEARS = 2;

export const ALLOWED_DOCUMENT_MIME_TYPES = Object.freeze([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'application/pdf',
]);

export const ALLOWED_SELFIE_MIME_TYPES = Object.freeze([
  'image/jpeg',
  'image/jpg',
  'image/png',
]);

export const KYC_ACCESS_LEVELS = Object.freeze({
  LEVEL_0_VISITOR: 'VISITOR',
  LEVEL_1_REGISTERED: 'REGISTERED',
  LEVEL_2_KYC_PENDING: 'KYC_PENDING',
  LEVEL_3_KYC_VERIFIED: 'KYC_VERIFIED',
  LEVEL_4_RESTRICTED: 'RESTRICTED',
});

export const KYC_GATED_FEATURES = Object.freeze({
  SUBSCRIPTION: 'subscription',
  TRADING: 'trading',
  REFERRAL: 'referral',
  WITHDRAWAL: 'withdrawal',
  PROVIDER_ACTIVATION: 'provider_activation',
  MARKETPLACE_SELLER: 'marketplace_seller',
});