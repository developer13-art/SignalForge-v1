/**
 * Performance Module Constants
 *
 * @module signalforge/server/modules/performance/constants
 */
const PERFORMANCE_EVENTS = Object.freeze({
  PERIOD_OPENED: 'performance.period.opened',
  PERIOD_UPDATED: 'performance.period.updated',
  PERIOD_FROZEN: 'performance.period.frozen',
  PERIOD_CLOSED: 'performance.period.closed',
  METRIC_CALCULATED: 'performance.metric.calculated',
  EQUITY_SNAPSHOT_CAPTURED: 'performance.equity.snapshot.captured',
  EQUITY_RECONSTRUCTED: 'performance.equity.reconstructed',
  ELIGIBLE_NET_PROFIT_COMPUTED: 'performance.eligible_net_profit.computed',
  PERIOD_CALCULATION_FAILED: 'performance.period.calculation.failed',
});
const PERIOD_STATUSES = Object.freeze({
  OPEN: 'OPEN',
  FROZEN: 'FROZEN',
  CALCULATING: 'CALCULATING',
  CLOSED: 'CLOSED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
});
const PERIOD_STATUS_VALUES = Object.freeze(Object.values(PERIOD_STATUSES));
const ELIGIBLE_COST_TYPES = Object.freeze({
  COMMISSION: 'COMMISSION',
  SWAP: 'SWAP',
  SPREAD: 'SPREAD',
  EXCHANGE_FEE: 'EXCHANGE_FEE',
  OTHER: 'OTHER',
});
const ELIGIBLE_COST_TYPE_VALUES = Object.freeze(
  Object.values(ELIGIBLE_COST_TYPES),
);
const DEFAULT_PERIOD_TYPE = 'MONTHLY';
const DEFAULT_FREEZE_GRACE_HOURS = 24;
const PERFORMANCE_METRIC_TYPES = Object.freeze({
  GROSS_PROFIT: 'GROSS_PROFIT',
  GROSS_LOSS: 'GROSS_LOSS',
  TRADING_COSTS: 'TRADING_COSTS',
  ELIGIBLE_NET_PROFIT: 'ELIGIBLE_NET_PROFIT',
  OPENING_BALANCE: 'OPENING_BALANCE',
  CLOSING_BALANCE: 'CLOSING_BALANCE',
});
const PERFORMANCE_METRIC_VALUES = Object.freeze(
  Object.values(PERFORMANCE_METRIC_TYPES),
);
function isValidPeriodStatus(status) {
  return PERIOD_STATUS_VALUES.includes(status);
}
function isValidEligibleCostType(type) {
  return ELIGIBLE_COST_TYPE_VALUES.includes(type);
}
function isValidPerformanceMetric(metric) {
  return PERFORMANCE_METRIC_VALUES.includes(metric);
}
function isPeriodEditable(status) {
  return status === PERIOD_STATUSES.OPEN;
}
function isPeriodFrozen(status) {
  return [
    PERIOD_STATUSES.FROZEN,
    PERIOD_STATUSES.CALCULATING,
    PERIOD_STATUSES.CLOSED,
  ].includes(status);
}
module.exports.PERFORMANCE_EVENTS = PERFORMANCE_EVENTS;
module.exports.PERIOD_STATUSES = PERIOD_STATUSES;
module.exports.PERIOD_STATUS_VALUES = PERIOD_STATUS_VALUES;
module.exports.ELIGIBLE_COST_TYPES = ELIGIBLE_COST_TYPES;
module.exports.ELIGIBLE_COST_TYPE_VALUES = ELIGIBLE_COST_TYPE_VALUES;
module.exports.DEFAULT_PERIOD_TYPE = DEFAULT_PERIOD_TYPE;
module.exports.DEFAULT_FREEZE_GRACE_HOURS = DEFAULT_FREEZE_GRACE_HOURS;
module.exports.PERFORMANCE_METRIC_TYPES = PERFORMANCE_METRIC_TYPES;
module.exports.PERFORMANCE_METRIC_VALUES = PERFORMANCE_METRIC_VALUES;
module.exports.isValidPeriodStatus = isValidPeriodStatus;
module.exports.isValidEligibleCostType = isValidEligibleCostType;
module.exports.isValidPerformanceMetric = isValidPerformanceMetric;
module.exports.isPeriodEditable = isPeriodEditable;
module.exports.isPeriodFrozen = isPeriodFrozen;
