/**
 * Affiliate Module Constants
 *
 * @module signalforge/server/modules/affiliate/constants
 */

export const AFFILIATE_EVENTS = Object.freeze({
  PARTNER_REGISTERED: 'affiliate.partner.registered',
  PARTNER_UPDATED: 'affiliate.partner.updated',
  PARTNER_APPROVED: 'affiliate.partner.approved',
  PARTNER_SUSPENDED: 'affiliate.partner.suspended',
  PARTNER_REINSTATED: 'affiliate.partner.reinstated',
  LINK_CREATED: 'affiliate.link.created',
  LINK_UPDATED: 'affiliate.link.updated',
  LINK_DELETED: 'affiliate.link.deleted',
  REFERRAL_ATTRIBUTED: 'affiliate.referral.attributed',
  REFERRAL_STATUS_CHANGED: 'affiliate.referral.status_changed',
  COMMISSION_CALCULATED: 'affiliate.commission.calculated',
  COMMISSION_APPROVED: 'affiliate.commission.approved',
  COMMISSION_PAID: 'affiliate.commission.paid',
  COMMISSION_REVERSED: 'affiliate.commission.reversed',
  PAYOUT_REQUESTED: 'affiliate.payout.requested',
  PAYOUT_COMPLETED: 'affiliate.payout.completed',
});

export const AFFILIATE_PARTNER_STATUSES = Object.freeze({
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  REJECTED: 'REJECTED',
  INACTIVE: 'INACTIVE',
});

export const AFFILIATE_PARTNER_STATUS_VALUES = Object.freeze(
  Object.values(AFFILIATE_PARTNER_STATUSES),
);

export const AFFILIATE_TIERS = Object.freeze({
  STANDARD: 'STANDARD',
  SILVER: 'SILVER',
  GOLD: 'GOLD',
  PLATINUM: 'PLATINUM',
});

export const AFFILIATE_TIER_VALUES = Object.freeze(Object.values(AFFILIATE_TIERS));

export const AFFILIATE_LINK_TYPES = Object.freeze({
  SIGNUP: 'SIGNUP',
  PROVIDER: 'PROVIDER',
  PLAN: 'PLAN',
  MARKETPLACE: 'MARKETPLACE',
  CUSTOM: 'CUSTOM',
});

export const AFFILIATE_LINK_TYPE_VALUES = Object.freeze(
  Object.values(AFFILIATE_LINK_TYPES),
);

export const AFFILIATE_REFERRAL_STATUSES = Object.freeze({
  ATTRIBUTED: 'ATTRIBUTED',
  ACTIVE: 'ACTIVE',
  CONVERTED: 'CONVERTED',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
});

export const AFFILIATE_REFERRAL_STATUS_VALUES = Object.freeze(
  Object.values(AFFILIATE_REFERRAL_STATUSES),
);

export const AFFILIATE_COMMISSION_STATUSES = Object.freeze({
  PENDING: 'PENDING',
  CALCULATED: 'CALCULATED',
  APPROVED: 'APPROVED',
  PAID: 'PAID',
  REJECTED: 'REJECTED',
  REVERSED: 'REVERSED',
});

export const AFFILIATE_COMMISSION_STATUS_VALUES = Object.freeze(
  Object.values(AFFILIATE_COMMISSION_STATUSES),
);

export const AFFILIATE_COMMISSION_TYPES = Object.freeze({
  REVENUE_SHARE: 'REVENUE_SHARE',
  FIXED_BONUS: 'FIXED_BONUS',
  FIRST_PAYMENT: 'FIRST_PAYMENT',
  RECURRING: 'RECURRING',
});

export const AFFILIATE_COMMISSION_TYPE_VALUES = Object.freeze(
  Object.values(AFFILIATE_COMMISSION_TYPES),
);

export const AFFILIATE_PAYOUT_STATUSES = Object.freeze({
  PENDING: 'PENDING',
  UNDER_REVIEW: 'UNDER_REVIEW',
  APPROVED: 'APPROVED',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  REJECTED: 'REJECTED',
  FAILED: 'FAILED',
});

export const AFFILIATE_PAYOUT_STATUS_VALUES = Object.freeze(
  Object.values(AFFILIATE_PAYOUT_STATUSES),
);

export const DEFAULT_AFFILIATE_COMMISSION_RATE = 0.2;
export const DEFAULT_AFFILIATE_COMMISSION_DURATION_MONTHS = 12;
export const DEFAULT_AFFILIATE_MIN_PAYOUT = 25;
export const DEFAULT_AFFILIATE_COOKIE_DAYS = 30;
export const DEFAULT_AFFILIATE_ATTRIBUTION_WINDOW_DAYS = 30;
export const DEFAULT_AFFILIATE_RECURRING_MONTHS = 12;
export const DEFAULT_AFFILIATE_MAX_COMMISSIONS_PER_REFERRAL = 24;
export const DEFAULT_AFFILIATE_CODE_LENGTH = 8;

export const AFFILIATE_TIER_RATES = Object.freeze({
  STANDARD: 0.15,
  SILVER: 0.2,
  GOLD: 0.25,
  PLATINUM: 0.3,
});

export function isValidPartnerStatus(status) {
  return AFFILIATE_PARTNER_STATUS_VALUES.includes(status);
}

export function isValidTier(tier) {
  return AFFILIATE_TIER_VALUES.includes(tier);
}

export function isValidLinkType(type) {
  return AFFILIATE_LINK_TYPE_VALUES.includes(type);
}

export function isValidReferralStatus(status) {
  return AFFILIATE_REFERRAL_STATUS_VALUES.includes(status);
}

export function isValidCommissionStatus(status) {
  return AFFILIATE_COMMISSION_STATUS_VALUES.includes(status);
}

export function isValidCommissionType(type) {
  return AFFILIATE_COMMISSION_TYPE_VALUES.includes(type);
}

export function isValidPayoutStatus(status) {
  return AFFILIATE_PAYOUT_STATUS_VALUES.includes(status);
}

export function getCommissionRateForTier(tier) {
  return AFFILIATE_TIER_RATES[tier] || DEFAULT_AFFILIATE_COMMISSION_RATE;
}

export function isPartnerActive(status) {
  return [
    AFFILIATE_PARTNER_STATUSES.APPROVED,
    AFFILIATE_PARTNER_STATUSES.ACTIVE,
  ].includes(status);
}