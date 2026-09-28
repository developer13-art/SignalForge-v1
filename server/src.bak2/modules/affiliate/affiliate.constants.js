/**
 * Affiliate Module Constants
 *
 * @module signalforge/server/modules/affiliate/constants
 */
const AFFILIATE_EVENTS = Object.freeze({
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
const AFFILIATE_PARTNER_STATUSES = Object.freeze({
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  REJECTED: 'REJECTED',
  INACTIVE: 'INACTIVE',
});
const AFFILIATE_PARTNER_STATUS_VALUES = Object.freeze(
  Object.values(AFFILIATE_PARTNER_STATUSES),
);
const AFFILIATE_TIERS = Object.freeze({
  STANDARD: 'STANDARD',
  SILVER: 'SILVER',
  GOLD: 'GOLD',
  PLATINUM: 'PLATINUM',
});
const AFFILIATE_TIER_VALUES = Object.freeze(Object.values(AFFILIATE_TIERS));
const AFFILIATE_LINK_TYPES = Object.freeze({
  SIGNUP: 'SIGNUP',
  PROVIDER: 'PROVIDER',
  PLAN: 'PLAN',
  MARKETPLACE: 'MARKETPLACE',
  CUSTOM: 'CUSTOM',
});
const AFFILIATE_LINK_TYPE_VALUES = Object.freeze(
  Object.values(AFFILIATE_LINK_TYPES),
);
const AFFILIATE_REFERRAL_STATUSES = Object.freeze({
  ATTRIBUTED: 'ATTRIBUTED',
  ACTIVE: 'ACTIVE',
  CONVERTED: 'CONVERTED',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
});
const AFFILIATE_REFERRAL_STATUS_VALUES = Object.freeze(
  Object.values(AFFILIATE_REFERRAL_STATUSES),
);
const AFFILIATE_COMMISSION_STATUSES = Object.freeze({
  PENDING: 'PENDING',
  CALCULATED: 'CALCULATED',
  APPROVED: 'APPROVED',
  PAID: 'PAID',
  REJECTED: 'REJECTED',
  REVERSED: 'REVERSED',
});
const AFFILIATE_COMMISSION_STATUS_VALUES = Object.freeze(
  Object.values(AFFILIATE_COMMISSION_STATUSES),
);
const AFFILIATE_COMMISSION_TYPES = Object.freeze({
  REVENUE_SHARE: 'REVENUE_SHARE',
  FIXED_BONUS: 'FIXED_BONUS',
  FIRST_PAYMENT: 'FIRST_PAYMENT',
  RECURRING: 'RECURRING',
});
const AFFILIATE_COMMISSION_TYPE_VALUES = Object.freeze(
  Object.values(AFFILIATE_COMMISSION_TYPES),
);
const AFFILIATE_PAYOUT_STATUSES = Object.freeze({
  PENDING: 'PENDING',
  UNDER_REVIEW: 'UNDER_REVIEW',
  APPROVED: 'APPROVED',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  REJECTED: 'REJECTED',
  FAILED: 'FAILED',
});
const AFFILIATE_PAYOUT_STATUS_VALUES = Object.freeze(
  Object.values(AFFILIATE_PAYOUT_STATUSES),
);
const DEFAULT_AFFILIATE_COMMISSION_RATE = 0.2;
const DEFAULT_AFFILIATE_COMMISSION_DURATION_MONTHS = 12;
const DEFAULT_AFFILIATE_MIN_PAYOUT = 25;
const DEFAULT_AFFILIATE_COOKIE_DAYS = 30;
const DEFAULT_AFFILIATE_ATTRIBUTION_WINDOW_DAYS = 30;
const DEFAULT_AFFILIATE_RECURRING_MONTHS = 12;
const DEFAULT_AFFILIATE_MAX_COMMISSIONS_PER_REFERRAL = 24;
const DEFAULT_AFFILIATE_CODE_LENGTH = 8;
const AFFILIATE_TIER_RATES = Object.freeze({
  STANDARD: 0.15,
  SILVER: 0.2,
  GOLD: 0.25,
  PLATINUM: 0.3,
});
function isValidPartnerStatus(status) {
  return AFFILIATE_PARTNER_STATUS_VALUES.includes(status);
}
function isValidTier(tier) {
  return AFFILIATE_TIER_VALUES.includes(tier);
}
function isValidLinkType(type) {
  return AFFILIATE_LINK_TYPE_VALUES.includes(type);
}
function isValidReferralStatus(status) {
  return AFFILIATE_REFERRAL_STATUS_VALUES.includes(status);
}
function isValidCommissionStatus(status) {
  return AFFILIATE_COMMISSION_STATUS_VALUES.includes(status);
}
function isValidCommissionType(type) {
  return AFFILIATE_COMMISSION_TYPE_VALUES.includes(type);
}
function isValidPayoutStatus(status) {
  return AFFILIATE_PAYOUT_STATUS_VALUES.includes(status);
}
function getCommissionRateForTier(tier) {
  return AFFILIATE_TIER_RATES[tier] || DEFAULT_AFFILIATE_COMMISSION_RATE;
}
function isPartnerActive(status) {
  return [
    AFFILIATE_PARTNER_STATUSES.APPROVED,
    AFFILIATE_PARTNER_STATUSES.ACTIVE,
  ].includes(status);
}
module.exports.AFFILIATE_EVENTS = AFFILIATE_EVENTS;
module.exports.AFFILIATE_PARTNER_STATUSES = AFFILIATE_PARTNER_STATUSES;
module.exports.AFFILIATE_PARTNER_STATUS_VALUES = AFFILIATE_PARTNER_STATUS_VALUES;
module.exports.AFFILIATE_TIERS = AFFILIATE_TIERS;
module.exports.AFFILIATE_TIER_VALUES = AFFILIATE_TIER_VALUES;
module.exports.AFFILIATE_LINK_TYPES = AFFILIATE_LINK_TYPES;
module.exports.AFFILIATE_LINK_TYPE_VALUES = AFFILIATE_LINK_TYPE_VALUES;
module.exports.AFFILIATE_REFERRAL_STATUSES = AFFILIATE_REFERRAL_STATUSES;
module.exports.AFFILIATE_REFERRAL_STATUS_VALUES = AFFILIATE_REFERRAL_STATUS_VALUES;
module.exports.AFFILIATE_COMMISSION_STATUSES = AFFILIATE_COMMISSION_STATUSES;
module.exports.AFFILIATE_COMMISSION_STATUS_VALUES = AFFILIATE_COMMISSION_STATUS_VALUES;
module.exports.AFFILIATE_COMMISSION_TYPES = AFFILIATE_COMMISSION_TYPES;
module.exports.AFFILIATE_COMMISSION_TYPE_VALUES = AFFILIATE_COMMISSION_TYPE_VALUES;
module.exports.AFFILIATE_PAYOUT_STATUSES = AFFILIATE_PAYOUT_STATUSES;
module.exports.AFFILIATE_PAYOUT_STATUS_VALUES = AFFILIATE_PAYOUT_STATUS_VALUES;
module.exports.DEFAULT_AFFILIATE_COMMISSION_RATE = DEFAULT_AFFILIATE_COMMISSION_RATE;
module.exports.DEFAULT_AFFILIATE_COMMISSION_DURATION_MONTHS = DEFAULT_AFFILIATE_COMMISSION_DURATION_MONTHS;
module.exports.DEFAULT_AFFILIATE_MIN_PAYOUT = DEFAULT_AFFILIATE_MIN_PAYOUT;
module.exports.DEFAULT_AFFILIATE_COOKIE_DAYS = DEFAULT_AFFILIATE_COOKIE_DAYS;
module.exports.DEFAULT_AFFILIATE_ATTRIBUTION_WINDOW_DAYS = DEFAULT_AFFILIATE_ATTRIBUTION_WINDOW_DAYS;
module.exports.DEFAULT_AFFILIATE_RECURRING_MONTHS = DEFAULT_AFFILIATE_RECURRING_MONTHS;
module.exports.DEFAULT_AFFILIATE_MAX_COMMISSIONS_PER_REFERRAL = DEFAULT_AFFILIATE_MAX_COMMISSIONS_PER_REFERRAL;
module.exports.DEFAULT_AFFILIATE_CODE_LENGTH = DEFAULT_AFFILIATE_CODE_LENGTH;
module.exports.AFFILIATE_TIER_RATES = AFFILIATE_TIER_RATES;
module.exports.isValidPartnerStatus = isValidPartnerStatus;
module.exports.isValidTier = isValidTier;
module.exports.isValidLinkType = isValidLinkType;
module.exports.isValidReferralStatus = isValidReferralStatus;
module.exports.isValidCommissionStatus = isValidCommissionStatus;
module.exports.isValidCommissionType = isValidCommissionType;
module.exports.isValidPayoutStatus = isValidPayoutStatus;
module.exports.getCommissionRateForTier = getCommissionRateForTier;
module.exports.isPartnerActive = isPartnerActive;
