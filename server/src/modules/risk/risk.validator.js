/**
 * Risk Validator
 *
 * Provides validation for risk profile updates, risk check requests,
 * and risk decision payloads.
 *
 * @module server/modules/risk/risk.validator
 */

import { AppError } from '../../lib/errors/app-error';
import { ERROR_CODES } from '../../lib/errors/error-codes';

const MAX_DAILY_LOSS_MIN = 1;
const MAX_DAILY_LOSS_MAX = 1000000;
const MAX_DRAWDOWN_MIN = 0.01;
const MAX_DRAWDOWN_MAX = 1;
const MAX_OPEN_TRADES_MIN = 1;
const MAX_OPEN_TRADES_MAX = 500;
const RISK_PERCENT_MIN = 0.01;
const RISK_PERCENT_MAX = 10;

const VALID_SESSIONS = Object.freeze([
  'SYDNEY',
  'TOKYO',
  'LONDON',
  'NEW_YORK',
]);

function toBoolean(value, defaultValue = false) {
  if (value === undefined || value === null) {
    return defaultValue;
  }
  return Boolean(value);
}

function toNumber(value, fieldName, { min, max, allowNull = false } = {}) {
  if (value === undefined || value === null) {
    if (allowNull) {
      return null;
    }
    throw new AppError(`${fieldName} is required`, ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const num = Number(value);

  if (!Number.isFinite(num)) {
    throw new AppError(`${fieldName} must be a number`, ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (min !== undefined && num < min) {
    throw new AppError(`${fieldName} must be at least ${min}`, ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (max !== undefined && num > max) {
    throw new AppError(`${fieldName} must not exceed ${max}`, ERROR_CODES.VALIDATION_FAILED, 400);
  }

  return num;
}

export function validateRiskProfilePayload(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new AppError('Payload must be an object', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const result = {};

  if (payload.riskPercent !== undefined) {
    result.risk_percent = toNumber(payload.riskPercent, 'riskPercent', {
      min: RISK_PERCENT_MIN,
      max: RISK_PERCENT_MAX,
    });
  }

  if (payload.maxDailyLoss !== undefined) {
    result.max_daily_loss = toNumber(payload.maxDailyLoss, 'maxDailyLoss', {
      min: MAX_DAILY_LOSS_MIN,
      max: MAX_DAILY_LOSS_MAX,
    });
  }

  if (payload.maxDrawdown !== undefined) {
    result.max_drawdown = toNumber(payload.maxDrawdown, 'maxDrawdown', {
      min: MAX_DRAWDOWN_MIN,
      max: MAX_DRAWDOWN_MAX,
    });
  }

  if (payload.maxOpenTrades !== undefined) {
    result.max_open_trades = Math.floor(
      toNumber(payload.maxOpenTrades, 'maxOpenTrades', {
        min: MAX_OPEN_TRADES_MIN,
        max: MAX_OPEN_TRADES_MAX,
      }),
    );
  }

  if (payload.tradingSessions !== undefined) {
    if (!Array.isArray(payload.tradingSessions)) {
      throw new AppError('tradingSessions must be an array', ERROR_CODES.VALIDATION_FAILED, 400);
    }
    const invalid = payload.tradingSessions.filter((s) => !VALID_SESSIONS.includes(s));
    if (invalid.length > 0) {
      throw new AppError(`Invalid trading sessions: ${invalid.join(', ')}`, ERROR_CODES.VALIDATION_FAILED, 400);
    }
    result.trading_sessions = payload.tradingSessions;
  }

  if (payload.trailingStopEnabled !== undefined) {
    result.trailing_stop_enabled = toBoolean(payload.trailingStopEnabled);
  }

  if (payload.breakEvenEnabled !== undefined) {
    result.break_even_enabled = toBoolean(payload.breakEvenEnabled);
  }

  if (payload.profitLockEnabled !== undefined) {
    result.profit_lock_enabled = toBoolean(payload.profitLockEnabled);
  }

  if (payload.partialCloseEnabled !== undefined) {
    result.partial_close_enabled = toBoolean(payload.partialCloseEnabled);
  }

  if (payload.correlationProtectionEnabled !== undefined) {
    result.correlation_protection_enabled = toBoolean(payload.correlationProtectionEnabled);
  }

  if (payload.newsFilterEnabled !== undefined) {
    result.news_filter_enabled = toBoolean(payload.newsFilterEnabled);
  }

  if (payload.emergencyStopEnabled !== undefined) {
    result.emergency_stop_enabled = toBoolean(payload.emergencyStopEnabled);
  }

  return result;
}

export function validateRiskCheckRequest({ signalId, userId, brokerAccountId }) {
  if (!signalId || typeof signalId !== 'string') {
    throw new AppError('signalId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (!userId || typeof userId !== 'string') {
    throw new AppError('userId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (brokerAccountId && typeof brokerAccountId !== 'string') {
    throw new AppError('brokerAccountId must be a string', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  return {
    signalId,
    userId,
    brokerAccountId: brokerAccountId || null,
  };
}

export function validateRiskDecision(decision) {
  if (!decision || typeof decision !== 'object') {
    throw new AppError('Risk decision must be an object', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const validDecisions = ['APPROVED', 'REJECTED', 'REQUIRES_MANUAL_REVIEW'];

  if (!decision.decision || !validDecisions.includes(decision.decision)) {
    throw new AppError(`Invalid risk decision: ${decision.decision}`, ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (!Array.isArray(decision.checks)) {
    throw new AppError('checks must be an array', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  return {
    decision: decision.decision,
    approvedVolume: decision.approvedVolume ?? null,
    approvedRiskPercent: decision.approvedRiskPercent ?? null,
    checks: decision.checks,
    failedChecks: decision.failedChecks || [],
    reason: decision.reason || null,
  };
}

export function validateEmergencyStopPayload({ userId, reason }) {
  if (!userId || typeof userId !== 'string') {
    throw new AppError('userId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  return {
    userId,
    reason: reason ? String(reason).substring(0, 500) : 'USER_INITIATED',
  };
}

export const RISK_VALIDATION_CONSTRAINTS = Object.freeze({
  riskPercentMin: RISK_PERCENT_MIN,
  riskPercentMax: RISK_PERCENT_MAX,
  maxDailyLossMin: MAX_DAILY_LOSS_MIN,
  maxDailyLossMax: MAX_DAILY_LOSS_MAX,
  maxDrawdownMin: MAX_DRAWDOWN_MIN,
  maxDrawdownMax: MAX_DRAWDOWN_MAX,
  maxOpenTradesMin: MAX_OPEN_TRADES_MIN,
  maxOpenTradesMax: MAX_OPEN_TRADES_MAX,
  validSessions: VALID_SESSIONS,
});