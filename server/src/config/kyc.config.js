/**
 * KYC Configuration
 *
 * Configures the KYC workflow, including provider selection, document
 * requirements, and access gating.
 *
 * @module signalforge/server/config/kyc
 */

function toNumber(value, fallback = null) {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toBoolean(value, fallback = false) {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  return ['true', '1', 'yes', 'on', 'enabled'].includes(String(value).toLowerCase());
}

const kycConfig = Object.freeze({
  enabled: toBoolean(process.env.KYC_ENABLED, true),
  provider: process.env.KYC_PROVIDER || 'smileid',

  supportedProviders: ['smileid', 'verifyme', 'manual'],

  requiredFor: {
    subscription: toBoolean(process.env.KYC_REQUIRED_FOR_SUBSCRIPTION, true),
    trading: toBoolean(process.env.KYC_REQUIRED_FOR_TRADING, true),
    referrals: toBoolean(process.env.KYC_REQUIRED_FOR_REFERRAL, true),
    withdrawals: toBoolean(process.env.KYC_REQUIRED_FOR_WITHDRAWAL, true),
    providerActivation: toBoolean(process.env.KYC_REQUIRED_FOR_PROVIDER, true),
    marketplaceSeller: toBoolean(process.env.KYC_REQUIRED_FOR_SELLER, true),
  },

  documents: {
    allowedTypes: [
      'NATIONAL_ID',
      'VOTERS_CARD',
      'DRIVERS_LICENSE',
      'INTERNATIONAL_PASSPORT',
      'RESIDENCE_PERMIT',
      'OTHER',
    ],
    allowedMimeTypes: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/pdf',
    ],
    maxFileSizeMb: toNumber(process.env.KYC_MAX_FILE_SIZE_MB, 10),
    minResolutionPx: toNumber(process.env.KYC_MIN_RESOLUTION_PX, 640),
    requireBothSidesForId: toBoolean(process.env.KYC_REQUIRE_BOTH_SIDES, false),
  },

  selfie: {
    required: toBoolean(process.env.KYC_SELFIE_REQUIRED, true),
    allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png'],
    maxFileSizeMb: toNumber(process.env.KYC_SELFIE_MAX_FILE_SIZE_MB, 5),
    livenessThreshold: toNumber(process.env.KYC_LIVENESS_THRESHOLD, 0.8),
  },

  autoApproval: {
    enabled: toBoolean(process.env.KYC_AUTO_APPROVAL_ENABLED, true),
    minConfidenceScore: toNumber(process.env.KYC_AUTO_APPROVAL_MIN_CONFIDENCE, 0.9),
    minRiskScore: toNumber(process.env.KYC_AUTO_APPROVAL_MIN_RISK_SCORE, 0.2),
    requireLiveness: true,
    requireDocumentCheck: true,
    requireNameMatch: true,
  },

  manualReview: {
    enabled: true,
    queueSizeLimit: toNumber(process.env.KYC_MANUAL_QUEUE_SIZE, 1000),
    slaHours: toNumber(process.env.KYC_MANUAL_SLA_HOURS, 24),
    requireTwoReviewers: toBoolean(process.env.KYC_REQUIRE_TWO_REVIEWERS, false),
  },

  expiry: {
    enabled: toBoolean(process.env.KYC_EXPIRY_ENABLED, true),
    years: toNumber(process.env.KYC_EXPIRY_YEARS, 2),
    reminderDaysBefore: [30, 14, 7, 1],
    graceperiodDays: toNumber(process.env.KYC_EXPIRY_GRACE_DAYS, 7),
  },

  reverification: {
    enabled: true,
    triggerOnProfileChange: true,
    triggerOnSuspiciousActivity: true,
    triggerOnDocumentExpiry: true,
  },

  retention: {
    years: toNumber(process.env.KYC_RETENTION_YEARS, 7),
    encryptDocuments: true,
    deleteAfterRetention: toBoolean(process.env.KYC_DELETE_AFTER_RETENTION, true),
  },

  levels: {
    level0: 'VISITOR',
    level1: 'REGISTERED',
    level2: 'KYC_PENDING',
    level3: 'KYC_VERIFIED',
    level4: 'RESTRICTED',
  },
});

export default kycConfig;