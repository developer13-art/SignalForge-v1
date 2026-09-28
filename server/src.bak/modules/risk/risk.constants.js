/**
 * Risk Module Constants
 *
 * @module signalforge/server/modules/risk/constants
 */

export const RISK_EVENTS = Object.freeze({
  RISK_CHECK_STARTED: 'risk.check.started',
  RISK_CHECK_COMPLETED: 'risk.check.completed',
  RISK_CHECK_FAILED: 'risk.check.failed',
  RISK_APPROVED: 'risk.approved',
  RISK_REJECTED: 'risk.rejected',
  RISK_REQUIRES_REVIEW: 'risk.requires_review',
  RISK_PROFILE_CREATED: 'risk.profile.created',
  RISK_PROFILE_UPDATED: 'risk.profile.updated',
  RISK_LIMIT_HIT: 'risk.limit.hit',
  RISK_EMERGENCY_STOP: 'risk.emergency.stop',
  RISK_DAILY_LOSS_EXCEEDED: 'risk.daily_loss.exceeded',
  RISK_DRAWDOWN_EXCEEDED: 'risk.drawdown.exceeded',
  RISK_NEWS_FILTER_BLOCKED: 'risk.news_filter.blocked',
  RISK_SESSION_BLOCKED: 'risk.session.blocked',
  RISK_CORRELATION_BLOCKED: 'risk.correlation.blocked',
  RISK_MARGIN_INSUFFICIENT: 'risk.margin.insufficient',
  RISK_SPREAD_TOO_WIDE: 'risk.spread.too_wide',
  RISK_SLIPPAGE_EXCEEDED: 'risk.slippage.exceeded',
});

export const RISK_DECISIONS = Object.freeze({
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  REQUIRES_MANUAL_REVIEW: 'REQUIRES_MANUAL_REVIEW',
});

export const RISK_DECISION_VALUES = Object.freeze(Object.values(RISK_DECISIONS));

export const RISK_CHECKS = Object.freeze({
  MAX_DAILY_LOSS: 'MAX_DAILY_LOSS',
  MAX_DRAWDOWN: 'MAX_DRAWDOWN',
  TRADING_SESSION: 'TRADING_SESSION',
  NEWS_FILTER: 'NEWS_FILTER',
  MAX_OPEN_TRADES: 'MAX_OPEN_TRADES',
  LOT_SIZE: 'LOT_SIZE',
  DUPLICATE_TRADE: 'DUPLICATE_TRADE',
  ALREADY_CLOSED: 'ALREADY_CLOSED',
  PROVIDER_DISABLED: 'PROVIDER_DISABLED',
  CORRELATION: 'CORRELATION',
  MARGIN: 'MARGIN',
  SPREAD: 'SPREAD',
  SLIPPAGE: 'SLIPPAGE',
});

export const RISK_CHECK_VALUES = Object.freeze(Object.values(RISK_CHECKS));

export const RISK_CHECK_SEVERITY = Object.freeze({
  MAX_DAILY_LOSS: 'CRITICAL',
  MAX_DRAWDOWN: 'CRITICAL',
  MARGIN: 'CRITICAL',
  LOT_SIZE: 'HIGH',
  MAX_OPEN_TRADES: 'HIGH',
  TRADING_SESSION: 'MEDIUM',
  NEWS_FILTER: 'HIGH',
  DUPLICATE_TRADE: 'HIGH',
  ALREADY_CLOSED: 'HIGH',
  PROVIDER_DISABLED: 'HIGH',
  CORRELATION: 'MEDIUM',
  SPREAD: 'MEDIUM',
  SLIPPAGE: 'MEDIUM',
});

export const RISK_PROFILE_DEFAULTS = Object.freeze({
  riskPercent: 1.0,
  maxDailyLoss: 500,
  maxDrawdownPercent: 20,
  maxOpenTrades: 10,
  maxLotSize: 1.0,
  maxSpreadPips: 5,
  maxSlippagePips: 3,
  trailingStopEnabled: true,
  trailingStopPips: 20,
  breakEvenEnabled: true,
  breakEvenPips: 15,
  profitLockEnabled: false,
  profitLockPips: 30,
  partialCloseEnabled: false,
  partialClosePercent: 50,
  correlationProtectionEnabled: true,
  maxCorrelatedPositions: 3,
  newsFilterEnabled: true,
  newsFilterMinutesBefore: 15,
  newsFilterMinutesAfter: 15,
  emergencyStopEnabled: true,
});

export const DEFAULT_MAX_DAILY_LOSS = 500;
export const DEFAULT_MAX_DRAWDOWN_PERCENT = 20;
export const DEFAULT_MAX_OPEN_TRADES = 10;
export const DEFAULT_MAX_LOT_SIZE = 1.0;
export const DEFAULT_MAX_SPREAD_PIPS = 5;
export const DEFAULT_MAX_SLIPPAGE_PIPS = 3;
export const DEFAULT_MIN_RISK_PERCENT = 0.01;
export const DEFAULT_MAX_RISK_PERCENT = 10;

export function isValidRiskDecision(decision) {
  return RISK_DECISION_VALUES.includes(decision);
}

export function isValidRiskCheck(checkName) {
  return RISK_CHECK_VALUES.includes(checkName);
}

export function getRiskCheckSeverity(checkName) {
  return RISK_CHECK_SEVERITY[checkName] || 'MEDIUM';
}