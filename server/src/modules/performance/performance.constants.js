/**
 * Performance Module Constants
 *
 * @module signalforge/server/modules/performance/constants
 */

export const PERFORMANCE_EVENTS = Object.freeze({
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

export const PERIOD_STATUSES = Object.freeze({
  OPEN: 'OPEN',
  FROZEN: 'FROZEN',
  CALCULATING: 'CALCULATING',
  CLOSED: 'CLOSED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
});

export const PERIOD_STATUS_VALUES = Object.freeze(Object.values(PERIOD_STATUSES));

export const ELIGIBLE_COST_TYPES = Object.freeze({
  COMMISSION: 'COMMISSION',
  SWAP: 'SWAP',
  SPREAD: 'SPREAD',
  EXCHANGE_FEE: 'EXCHANGE_FEE',
  OTHER: 'OTHER',
});

export const ELIGIBLE_COST_TYPE_VALUES = Object.freeze(
  Object.values(ELIGIBLE_COST_TYPES),
);

export const DEFAULT_PERIOD_TYPE = 'MONTHLY';
export const DEFAULT_FREEZE_GRACE_HOURS = 24;

export const PERFORMANCE_METRIC_TYPES = Object.freeze({
  GROSS_PROFIT: 'GROSS_PROFIT',
  GROSS_LOSS: 'GROSS_LOSS',
  TRADING_COSTS: 'TRADING_COSTS',
  ELIGIBLE_NET_PROFIT: 'ELIGIBLE_NET_PROFIT',
  OPENING_BALANCE: 'OPENING_BALANCE',
  CLOSING_BALANCE: 'CLOSING_BALANCE',
});

export const PERFORMANCE_METRIC_VALUES = Object.freeze(
  Object.values(PERFORMANCE_METRIC_TYPES),
);

export function isValidPeriodStatus(status) {
  return PERIOD_STATUS_VALUES.includes(status);
}

export function isValidEligibleCostType(type) {
  return ELIGIBLE_COST_TYPE_VALUES.includes(type);
}

export function isValidPerformanceMetric(metric) {
  return PERFORMANCE_METRIC_VALUES.includes(metric);
}

export function isPeriodEditable(status) {
  return status === PERIOD_STATUSES.OPEN;
}

export function isPeriodFrozen(status) {
  return [
    PERIOD_STATUSES.FROZEN,
    PERIOD_STATUSES.CALCULATING,
    PERIOD_STATUSES.CLOSED,
  ].includes(status);
}