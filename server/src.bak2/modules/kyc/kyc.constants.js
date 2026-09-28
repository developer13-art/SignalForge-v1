/**
 * KYC Module Constants
 *
 * @module signalforge/server/modules/kyc/constants
 */
const KYC_EVENTS = Object.freeze({
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
const KYC_DOCUMENT_TYPES = Object.freeze({
  NATIONAL_ID: 'NATIONAL_ID',
  VOTERS_CARD: 'VOTERS_CARD',
  DRIVERS_LICENSE: 'DRIVERS_LICENSE',
  INTERNATIONAL_PASSPORT: 'INTERNATIONAL_PASSPORT',
  RESIDENCE_PERMIT: 'RESIDENCE_PERMIT',
  OTHER: 'OTHER',
});
const KYC_PROVIDERS = Object.freeze({
  SMILE_ID: 'smileid',
  VERIFYME: 'verifyme',
  MANUAL: 'manual',
});
const VERIFICATION_RESULTS = Object.freeze({
  PASSED: 'PASSED',
  FAILED: 'FAILED',
  INCONCLUSIVE: 'INCONCLUSIVE',
  ERROR: 'ERROR',
});
const QUALITY_CHECK_RESULTS = Object.freeze({
  PASSED: 'PASSED',
  FAILED: 'FAILED',
  WARNING: 'WARNING',
});
const DEFAULT_MIN_RESOLUTION = 640;
const DEFAULT_MAX_FILE_SIZE_MB = 10;
const DEFAULT_SELFIE_MAX_FILE_SIZE_MB = 5;
const DEFAULT_LIVENESS_THRESHOLD = 0.8;
const DEFAULT_NAME_MATCH_THRESHOLD = 0.85;
const DEFAULT_AUTO_APPROVAL_CONFIDENCE = 0.9;
const DEFAULT_AUTO_APPROVAL_RISK_SCORE = 0.2;
const DEFAULT_KYC_EXPIRY_YEARS = 2;
const ALLOWED_DOCUMENT_MIME_TYPES = Object.freeze([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'application/pdf',
]);
const ALLOWED_SELFIE_MIME_TYPES = Object.freeze([
  'image/jpeg',
  'image/jpg',
  'image/png',
]);
const KYC_ACCESS_LEVELS = Object.freeze({
  LEVEL_0_VISITOR: 'VISITOR',
  LEVEL_1_REGISTERED: 'REGISTERED',
  LEVEL_2_KYC_PENDING: 'KYC_PENDING',
  LEVEL_3_KYC_VERIFIED: 'KYC_VERIFIED',
  LEVEL_4_RESTRICTED: 'RESTRICTED',
});
const KYC_GATED_FEATURES = Object.freeze({
  SUBSCRIPTION: 'subscription',
  TRADING: 'trading',
  REFERRAL: 'referral',
  WITHDRAWAL: 'withdrawal',
  PROVIDER_ACTIVATION: 'provider_activation',
  MARKETPLACE_SELLER: 'marketplace_seller',
});
module.exports.KYC_EVENTS = KYC_EVENTS;
module.exports.KYC_DOCUMENT_TYPES = KYC_DOCUMENT_TYPES;
module.exports.KYC_PROVIDERS = KYC_PROVIDERS;
module.exports.VERIFICATION_RESULTS = VERIFICATION_RESULTS;
module.exports.QUALITY_CHECK_RESULTS = QUALITY_CHECK_RESULTS;
module.exports.DEFAULT_MIN_RESOLUTION = DEFAULT_MIN_RESOLUTION;
module.exports.DEFAULT_MAX_FILE_SIZE_MB = DEFAULT_MAX_FILE_SIZE_MB;
module.exports.DEFAULT_SELFIE_MAX_FILE_SIZE_MB = DEFAULT_SELFIE_MAX_FILE_SIZE_MB;
module.exports.DEFAULT_LIVENESS_THRESHOLD = DEFAULT_LIVENESS_THRESHOLD;
module.exports.DEFAULT_NAME_MATCH_THRESHOLD = DEFAULT_NAME_MATCH_THRESHOLD;
module.exports.DEFAULT_AUTO_APPROVAL_CONFIDENCE = DEFAULT_AUTO_APPROVAL_CONFIDENCE;
module.exports.DEFAULT_AUTO_APPROVAL_RISK_SCORE = DEFAULT_AUTO_APPROVAL_RISK_SCORE;
module.exports.DEFAULT_KYC_EXPIRY_YEARS = DEFAULT_KYC_EXPIRY_YEARS;
module.exports.ALLOWED_DOCUMENT_MIME_TYPES = ALLOWED_DOCUMENT_MIME_TYPES;
module.exports.ALLOWED_SELFIE_MIME_TYPES = ALLOWED_SELFIE_MIME_TYPES;
module.exports.KYC_ACCESS_LEVELS = KYC_ACCESS_LEVELS;
module.exports.KYC_GATED_FEATURES = KYC_GATED_FEATURES;
