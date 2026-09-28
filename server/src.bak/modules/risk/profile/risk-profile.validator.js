/**
 * Risk Profile Validator
 *
 * @module signalforge/server/modules/risk/profile/validator
 */

import {
  DEFAULT_MIN_RISK_PERCENT,
  DEFAULT_MAX_RISK_PERCENT,
} from '../risk.constants.js';

export function validateRiskProfilePayload(body, options = {}) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (body.riskPercent !== undefined) {
    if (typeof body.riskPercent !== 'number') {
      errors.push('riskPercent must be a number');
    } else if (body.riskPercent < DEFAULT_MIN_RISK_PERCENT || body.riskPercent > DEFAULT_MAX_RISK_PERCENT) {
      errors.push(`riskPercent must be between ${DEFAULT_MIN_RISK_PERCENT} and ${DEFAULT_MAX_RISK_PERCENT}`);
    }
  }

  if (body.maxDailyLoss !== undefined) {
    if (typeof body.maxDailyLoss !== 'number' || body.maxDailyLoss < 0) {
      errors.push('maxDailyLoss must be a non-negative number');
    }
  }

  if (body.maxDrawdownPercent !== undefined) {
    if (typeof body.maxDrawdownPercent !== 'number' || body.maxDrawdownPercent < 0 || body.maxDrawdownPercent > 100) {
      errors.push('maxDrawdownPercent must be between 0 and 100');
    }
  }

  if (body.maxOpenTrades !== undefined) {
    if (typeof body.maxOpenTrades !== 'number' || body.maxOpenTrades < 1 || body.maxOpenTrades > 100) {
      errors.push('maxOpenTrades must be between 1 and 100');
    }
  }

  if (body.maxLotSize !== undefined) {
    if (typeof body.maxLotSize !== 'number' || body.maxLotSize <= 0) {
      errors.push('maxLotSize must be a positive number');
    }
  }

  if (body.maxSpreadPips !== undefined) {
    if (typeof body.maxSpreadPips !== 'number' || body.maxSpreadPips < 0) {
      errors.push('maxSpreadPips must be a non-negative number');
    }
  }

  if (body.maxSlippagePips !== undefined) {
    if (typeof body.maxSlippagePips !== 'number' || body.maxSlippagePips < 0) {
      errors.push('maxSlippagePips must be a non-negative number');
    }
  }

  const booleanFields = [
    'trailingStopEnabled',
    'breakEvenEnabled',
    'profitLockEnabled',
    'partialCloseEnabled',
    'correlationProtectionEnabled',
    'newsFilterEnabled',
    'emergencyStopEnabled',
  ];

  for (const field of booleanFields) {
    if (body[field] !== undefined && typeof body[field] !== 'boolean') {
      errors.push(`${field} must be a boolean`);
    }
  }

  if (body.trailingStopPips !== undefined) {
    if (typeof body.trailingStopPips !== 'number' || body.trailingStopPips < 0) {
      errors.push('trailingStopPips must be a non-negative number');
    }
  }

  if (body.breakEvenPips !== undefined) {
    if (typeof body.breakEvenPips !== 'number' || body.breakEvenPips < 0) {
      errors.push('breakEvenPips must be a non-negative number');
    }
  }

  if (body.profitLockPips !== undefined) {
    if (typeof body.profitLockPips !== 'number' || body.profitLockPips < 0) {
      errors.push('profitLockPips must be a non-negative number');
    }
  }

  if (body.partialClosePercent !== undefined) {
    if (typeof body.partialClosePercent !== 'number' || body.partialClosePercent <= 0 || body.partialClosePercent > 100) {
      errors.push('partialClosePercent must be between 1 and 100');
    }
  }

  if (body.maxCorrelatedPositions !== undefined) {
    if (typeof body.maxCorrelatedPositions !== 'number' || body.maxCorrelatedPositions < 1 || body.maxCorrelatedPositions > 50) {
      errors.push('maxCorrelatedPositions must be between 1 and 50');
    }
  }

  if (body.newsFilterMinutesBefore !== undefined) {
    if (typeof body.newsFilterMinutesBefore !== 'number' || body.newsFilterMinutesBefore < 0) {
      errors.push('newsFilterMinutesBefore must be a non-negative number');
    }
  }

  if (body.newsFilterMinutesAfter !== undefined) {
    if (typeof body.newsFilterMinutesAfter !== 'number' || body.newsFilterMinutesAfter < 0) {
      errors.push('newsFilterMinutesAfter must be a non-negative number');
    }
  }

  if (body.allowedSymbols !== undefined && !Array.isArray(body.allowedSymbols)) {
    errors.push('allowedSymbols must be an array');
  }

  if (body.blockedSymbols !== undefined && !Array.isArray(body.blockedSymbols)) {
    errors.push('blockedSymbols must be an array');
  }

  if (body.allowedProviders !== undefined && !Array.isArray(body.allowedProviders)) {
    errors.push('allowedProviders must be an array');
  }

  if (body.blockedProviders !== undefined && !Array.isArray(body.blockedProviders)) {
    errors.push('blockedProviders must be an array');
  }

  if (body.tradingSessions !== undefined && !Array.isArray(body.tradingSessions)) {
    errors.push('tradingSessions must be an array');
  }

  return { valid: errors.length === 0, errors };
}

export function validateEmergencyStopPayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (!body.reason || typeof body.reason !== 'string') {
    errors.push('reason is required');
  } else if (body.reason.length > 512) {
    errors.push('reason must not exceed 512 characters');
  }

  return { valid: errors.length === 0, errors };
}