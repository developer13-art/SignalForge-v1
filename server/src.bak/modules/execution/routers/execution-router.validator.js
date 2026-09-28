'use strict';

const {
  ROUTE_POLICY_MODES,
  ROUTE_FALLBACK_BEHAVIOR,
  INSTRUMENT_CLASSES,
  EXECUTION_GATEWAYS,
} = require('./execution-router.constants');

const {
  InvalidPolicyError,
  UnsupportedSymbolError,
} = require('./execution-router.errors');

const SYMBOL_PATTERN = /^[A-Z0-9/:_-]{3,32}$/;

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function validateSymbol(symbol) {
  if (!isNonEmptyString(symbol)) {
    throw new UnsupportedSymbolError('Symbol is required');
  }
  const normalized = symbol.trim().toUpperCase();
  if (!SYMBOL_PATTERN.test(normalized)) {
    throw new UnsupportedSymbolError('Symbol format is invalid', { symbol: normalized });
  }
  return normalized;
}

function validateOrderType(orderType) {
  const allowed = ['market', 'limit', 'stop', 'stop_limit', 'trailing_stop'];
  if (!isNonEmptyString(orderType)) {
    return 'market';
  }
  const normalized = orderType.trim().toLowerCase();
  if (!allowed.includes(normalized)) {
    return 'market';
  }
  return normalized;
}

function validateOrderDirection(direction) {
  if (!isNonEmptyString(direction)) {
    return 'BUY';
  }
  const normalized = direction.trim().toUpperCase();
  if (!['BUY', 'SELL', 'LONG', 'SHORT'].includes(normalized)) {
    return 'BUY';
  }
  if (normalized === 'LONG') {
    return 'BUY';
  }
  if (normalized === 'SHORT') {
    return 'SELL';
  }
  return normalized;
}

function validatePolicyMode(mode) {
  if (!isNonEmptyString(mode)) {
    return 'auto';
  }
  const normalized = mode.trim().toLowerCase();
  const allowed = Object.values(ROUTE_POLICY_MODES);
  if (!allowed.includes(normalized)) {
    throw new InvalidPolicyError(`Unsupported policy mode: ${normalized}`, {
      mode: normalized,
      allowed,
    });
  }
  return normalized;
}

function validateFallbackBehavior(behavior) {
  if (!isNonEmptyString(behavior)) {
    return 'retry_next';
  }
  const normalized = behavior.trim().toLowerCase();
  const allowed = Object.values(ROUTE_FALLBACK_BEHAVIOR);
  if (!allowed.includes(normalized)) {
    throw new InvalidPolicyError(`Unsupported fallback behavior: ${normalized}`, {
      behavior: normalized,
      allowed,
    });
  }
  return normalized;
}

function validateGatewayKey(gateway) {
  if (!isNonEmptyString(gateway)) {
    return null;
  }
  const normalized = gateway.trim().toLowerCase();
  const allowed = Object.values(EXECUTION_GATEWAYS);
  if (!allowed.includes(normalized)) {
    throw new InvalidPolicyError(`Unsupported gateway: ${normalized}`, {
      gateway: normalized,
      allowed,
    });
  }
  return normalized;
}

function validateInstrumentClass(instrumentClass) {
  if (!isNonEmptyString(instrumentClass)) {
    return null;
  }
  const normalized = instrumentClass.trim().toLowerCase();
  const allowed = Object.values(INSTRUMENT_CLASSES);
  if (!allowed.includes(normalized)) {
    return null;
  }
  return normalized;
}

function validateAmount(amount, { min = 0, max = 1e12, field = 'amount' } = {}) {
  if (amount === undefined || amount === null || amount === '') {
    return null;
  }
  const numeric = typeof amount === 'number' ? amount : Number(amount);
  if (!Number.isFinite(numeric)) {
    throw new InvalidPolicyError(`${field} must be a finite number`);
  }
  if (numeric < min || numeric > max) {
    throw new InvalidPolicyError(`${field} must be between ${min} and ${max}`, {
      [field]: numeric,
    });
  }
  return numeric;
}

function validateRouteRequest(payload) {
  if (!isPlainObject(payload)) {
    throw new InvalidPolicyError('Route request must be an object');
  }

  return {
    symbol: validateSymbol(payload.symbol),
    orderType: validateOrderType(payload.orderType),
    direction: validateOrderDirection(payload.direction),
    mode: validatePolicyMode(payload.mode),
    fallback: validateFallbackBehavior(payload.fallback),
    preferredGateway: validateGatewayKey(payload.preferredGateway),
    preferredInstrumentClass: validateInstrumentClass(payload.preferredInstrumentClass),
    amount: validateAmount(payload.amount, { field: 'amount' }),
    userId: payload.userId ? String(payload.userId).trim() : null,
    accountId: payload.accountId ? String(payload.accountId).trim() : null,
    providerId: payload.providerId ? String(payload.providerId).trim() : null,
    allowFallback:
      payload.allowFallback === undefined ? true : Boolean(payload.allowFallback),
    requireKycCheck:
      payload.requireKycCheck === undefined ? true : Boolean(payload.requireKycCheck),
  };
}

function validatePolicy(policy) {
  if (!isPlainObject(policy)) {
    throw new InvalidPolicyError('Policy must be an object');
  }

  return {
    mode: validatePolicyMode(policy.mode),
    fallback: validateFallbackBehavior(policy.fallback),
    preferredGateway: validateGatewayKey(policy.preferredGateway),
    preferredInstrumentClass: validateInstrumentClass(policy.preferredInstrumentClass),
    allowedGateways: Array.isArray(policy.allowedGateways)
      ? policy.allowedGateways.map(validateGatewayKey).filter(Boolean)
      : null,
    blockedGateways: Array.isArray(policy.blockedGateways)
      ? policy.blockedGateways.map(validateGatewayKey).filter(Boolean)
      : null,
    maxSlippageBps: policy.maxSlippageBps !== undefined ? Number(policy.maxSlippageBps) : null,
    priorityFeesMicroLamports:
      policy.priorityFeesMicroLamports !== undefined
        ? Number(policy.priorityFeesMicroLamports)
        : null,
  };
}

module.exports = {
  isNonEmptyString,
  isPlainObject,
  validateSymbol,
  validateOrderType,
  validateOrderDirection,
  validatePolicyMode,
  validateFallbackBehavior,
  validateGatewayKey,
  validateInstrumentClass,
  validateAmount,
  validateRouteRequest,
  validatePolicy,
};