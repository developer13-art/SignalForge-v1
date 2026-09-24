/**
 * Providers Module Constants
 *
 * @module signalforge/server/modules/providers/constants
 */

export const PROVIDER_EVENTS = Object.freeze({
  PROVIDER_REGISTERED: 'provider.registered',
  PROVIDER_UPDATED: 'provider.updated',
  PROVIDER_APPROVED: 'provider.approved',
  PROVIDER_SUSPENDED: 'provider.suspended',
  PROVIDER_REINSTATED: 'provider.reinstated',
  PROVIDER_CERTIFIED: 'provider.certified',
  PROVIDER_UNCERTIFIED: 'provider.uncertified',
  PROVIDER_PROFILE_UPDATED: 'provider.profile.updated',
  PROVIDER_AVATAR_UPDATED: 'provider.avatar.updated',
  PROVIDER_AVATAR_REMOVED: 'provider.avatar.removed',
  PROVIDER_REVENUE_UPDATED: 'provider.revenue.updated',
  PROVIDER_SUBSCRIBER_ADDED: 'provider.subscriber.added',
  PROVIDER_SUBSCRIBER_REMOVED: 'provider.subscriber.removed',
  CERTIFICATION_STARTED: 'provider.certification.started',
  CERTIFICATION_COMPLETED: 'provider.certification.completed',
  CERTIFICATION_FAILED: 'provider.certification.failed',
  CERTIFICATION_EXPIRED: 'provider.certification.expired',
  CERTIFICATION_REVOKED: 'provider.certification.revoked',
  HISTORICAL_IMPORT_STARTED: 'provider.certification.historical.started',
  HISTORICAL_IMPORT_COMPLETED: 'provider.certification.historical.completed',
  BACKTEST_COMPLETED: 'provider.certification.backtest.completed',
  SANDBOX_RUN_COMPLETED: 'provider.certification.sandbox.completed',
  PROMOTION_CREATED: 'provider.promotion.created',
  PROMOTION_UPDATED: 'provider.promotion.updated',
  PROMOTION_DELETED: 'provider.promotion.deleted',
});

export const PROVIDER_STATUSES = Object.freeze({
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  REJECTED: 'REJECTED',
  INACTIVE: 'INACTIVE',
});

export const PROVIDER_STATUS_VALUES = Object.freeze(Object.values(PROVIDER_STATUSES));

export const CERTIFICATION_STATUSES = Object.freeze({
  NOT_STARTED: 'NOT_STARTED',
  PENDING: 'PENDING',
  IMPORTING_HISTORY: 'IMPORTING_HISTORY',
  TRAINING: 'TRAINING',
  BACKTESTING: 'BACKTESTING',
  EVALUATING: 'EVALUATING',
  SANDBOX_RUNNING: 'SANDBOX_RUNNING',
  CERTIFIED: 'CERTIFIED',
  CONDITIONALLY_CERTIFIED: 'CONDITIONALLY_CERTIFIED',
  FAILED: 'FAILED',
  SUSPENDED: 'SUSPENDED',
  EXPIRED: 'EXPIRED',
  REVOKED: 'REVOKED',
});

export const CERTIFICATION_STATUS_VALUES = Object.freeze(
  Object.values(CERTIFICATION_STATUSES),
);

export const CERTIFIED_STATUSES = Object.freeze([
  CERTIFICATION_STATUSES.CERTIFIED,
  CERTIFICATION_STATUSES.CONDITIONALLY_CERTIFIED,
]);

export const CERTIFICATION_TIERS = Object.freeze({
  BRONZE: 'BRONZE',
  SILVER: 'SILVER',
  GOLD: 'GOLD',
  PLATINUM: 'PLATINUM',
});

export const CERTIFICATION_TIER_VALUES = Object.freeze(
  Object.values(CERTIFICATION_TIERS),
);

export const PROVIDER_VISIBILITY = Object.freeze({
  PUBLIC: 'PUBLIC',
  PRIVATE: 'PRIVATE',
  UNLISTED: 'UNLISTED',
});

export const PROVIDER_VISIBILITY_VALUES = Object.freeze(
  Object.values(PROVIDER_VISIBILITY),
);

export const PROMOTION_TYPES = Object.freeze({
  DISCOUNT_PERCENT: 'DISCOUNT_PERCENT',
  DISCOUNT_FIXED: 'DISCOUNT_FIXED',
  FREE_TRIAL_EXTENSION: 'FREE_TRIAL_EXTENSION',
  BUNDLE: 'BUNDLE',
});

export const PROMOTION_TYPE_VALUES = Object.freeze(Object.values(PROMOTION_TYPES));

export const PROMOTION_STATUSES = Object.freeze({
  DRAFT: 'DRAFT',
  SCHEDULED: 'SCHEDULED',
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
});

export const PROMOTION_STATUS_VALUES = Object.freeze(
  Object.values(PROMOTION_STATUSES),
);

export const PROVIDER_VERIFICATION_LEVELS = Object.freeze({
  UNVERIFIED: 'UNVERIFIED',
  EMAIL_VERIFIED: 'EMAIL_VERIFIED',
  IDENTITY_VERIFIED: 'IDENTITY_VERIFIED',
  FULLY_VERIFIED: 'FULLY_VERIFIED',
});

export const PROVIDER_VERIFICATION_LEVEL_VALUES = Object.freeze(
  Object.values(PROVIDER_VERIFICATION_LEVELS),
);

export const PROVIDER_TYPE = Object.freeze({
  SIGNAL_PROVIDER: 'SIGNAL_PROVIDER',
  TRADER: 'TRADER',
  EDUCATOR: 'EDUCATOR',
  HYBRID: 'HYBRID',
});

export const PROVIDER_TYPE_VALUES = Object.freeze(Object.values(PROVIDER_TYPE));

export const DEFAULT_CERTIFICATION_VALIDITY_DAYS = 365;
export const DEFAULT_MIN_HISTORICAL_MESSAGES = 300;
export const DEFAULT_MAX_HISTORICAL_MESSAGES = 5000;
export const DEFAULT_CERTIFICATION_MIN_ACCURACY = 0.9;
export const DEFAULT_CERTIFICATION_MIN_CONSISTENCY = 0.7;
export const DEFAULT_CERTIFICATION_MIN_QUALITY = 0.75;
export const DEFAULT_CERTIFICATION_MAX_RISK = 0.7;

export function isValidProviderStatus(status) {
  return PROVIDER_STATUS_VALUES.includes(status);
}

export function isValidCertificationStatus(status) {
  return CERTIFICATION_STATUS_VALUES.includes(status);
}

export function isValidCertificationTier(tier) {
  return CERTIFICATION_TIER_VALUES.includes(tier);
}

export function isValidProviderVisibility(visibility) {
  return PROVIDER_VISIBILITY_VALUES.includes(visibility);
}

export function isValidPromotionType(type) {
  return PROMOTION_TYPE_VALUES.includes(type);
}

export function isValidPromotionStatus(status) {
  return PROMOTION_STATUS_VALUES.includes(status);
}

export function isValidProviderType(type) {
  return PROVIDER_TYPE_VALUES.includes(type);
}

export function isCertified(status) {
  return CERTIFIED_STATUSES.includes(status);
}

export function isActive(status) {
  return [
    PROVIDER_STATUSES.APPROVED,
    PROVIDER_STATUSES.ACTIVE,
  ].includes(status);
}