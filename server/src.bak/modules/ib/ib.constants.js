/**
 * IB Constants
 *
 * Constants used throughout the Introducing Broker module.
 *
 * @module server/modules/ib/ib.constants
 */

export const IB_STATUSES = Object.freeze({
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
  TERMINATED: 'TERMINATED',
});

export const IB_STATUS_VALUES = Object.freeze(Object.values(IB_STATUSES));

export const IB_TIERS = Object.freeze({
  STANDARD: 'STANDARD',
  SILVER: 'SILVER',
  GOLD: 'GOLD',
  PLATINUM: 'PLATINUM',
  ENTERPRISE: 'ENTERPRISE',
});

export const IB_TIER_VALUES = Object.freeze(Object.values(IB_TIERS));

export const IB_TIER_RATES = Object.freeze({
  [IB_TIERS.STANDARD]: 0.15,
  [IB_TIERS.SILVER]: 0.2,
  [IB_TIERS.GOLD]: 0.25,
  [IB_TIERS.PLATINUM]: 0.3,
  [IB_TIERS.ENTERPRISE]: 0.35,
});

export const IB_REVENUE_STATUSES = Object.freeze({
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  PAID: 'PAID',
  REJECTED: 'REJECTED',
  REVERSED: 'REVERSED',
});

export const IB_REVENUE_STATUS_VALUES = Object.freeze(Object.values(IB_REVENUE_STATUSES));

export function getTierRate(tier) {
  return IB_TIER_RATES[tier] || IB_TIER_RATES[IB_TIERS.STANDARD];
}

export function isValidIbStatus(status) {
  return IB_STATUS_VALUES.includes(status);
}

export function isValidIbTier(tier) {
  return IB_TIER_VALUES.includes(tier);
}