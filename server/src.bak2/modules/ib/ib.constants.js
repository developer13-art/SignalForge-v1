/**
 * IB Constants
 *
 * Constants used throughout the Introducing Broker module.
 *
 * @module server/modules/ib/ib.constants
 */
const IB_STATUSES = Object.freeze({
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
  TERMINATED: 'TERMINATED',
});
const IB_STATUS_VALUES = Object.freeze(Object.values(IB_STATUSES));
const IB_TIERS = Object.freeze({
  STANDARD: 'STANDARD',
  SILVER: 'SILVER',
  GOLD: 'GOLD',
  PLATINUM: 'PLATINUM',
  ENTERPRISE: 'ENTERPRISE',
});
const IB_TIER_VALUES = Object.freeze(Object.values(IB_TIERS));
const IB_TIER_RATES = Object.freeze({
  [IB_TIERS.STANDARD]: 0.15,
  [IB_TIERS.SILVER]: 0.2,
  [IB_TIERS.GOLD]: 0.25,
  [IB_TIERS.PLATINUM]: 0.3,
  [IB_TIERS.ENTERPRISE]: 0.35,
});
const IB_REVENUE_STATUSES = Object.freeze({
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  PAID: 'PAID',
  REJECTED: 'REJECTED',
  REVERSED: 'REVERSED',
});
const IB_REVENUE_STATUS_VALUES = Object.freeze(Object.values(IB_REVENUE_STATUSES));
function getTierRate(tier) {
  return IB_TIER_RATES[tier] || IB_TIER_RATES[IB_TIERS.STANDARD];
}
function isValidIbStatus(status) {
  return IB_STATUS_VALUES.includes(status);
}
function isValidIbTier(tier) {
  return IB_TIER_VALUES.includes(tier);
}
module.exports.IB_STATUSES = IB_STATUSES;
module.exports.IB_STATUS_VALUES = IB_STATUS_VALUES;
module.exports.IB_TIERS = IB_TIERS;
module.exports.IB_TIER_VALUES = IB_TIER_VALUES;
module.exports.IB_TIER_RATES = IB_TIER_RATES;
module.exports.IB_REVENUE_STATUSES = IB_REVENUE_STATUSES;
module.exports.IB_REVENUE_STATUS_VALUES = IB_REVENUE_STATUS_VALUES;
module.exports.getTierRate = getTierRate;
module.exports.isValidIbStatus = isValidIbStatus;
module.exports.isValidIbTier = isValidIbTier;
