'use strict';

/**
 * SignalForge - Route Decision Schema
 *
 * Describes the shape of a route decision returned by the execution
 * router. Used by the frontend to render which gateway will execute
 * a trade and by internal services to persist decisions.
 */

const ROUTE_STATUS = Object.freeze({
  RESOLVED: 'resolved',
  FALLBACK: 'fallback',
  REJECTED: 'rejected',
  ERROR: 'error',
});

const ROUTE_REASONS = Object.freeze({
  SYMBOL_CLASS: 'symbol_class',
  USER_POLICY: 'user_policy',
  SYSTEM_DEFAULT: 'system_default',
  GATEWAY_UNAVAILABLE: 'gateway_unavailable',
  INSUFFICIENT_BALANCE: 'insufficient_balance',
  RISK_REJECTED: 'risk_rejected',
  KYC_REQUIRED: 'kyc_required',
  UNSUPPORTED_SYMBOL: 'unsupported_symbol',
  UNSUPPORTED_ORDER_TYPE: 'unsupported_order_type',
  UNSUPPORTED_ACCOUNT: 'unsupported_account',
});

const ROUTE_DECISION_SCHEMA = Object.freeze({
  type: 'object',
  required: ['routeId', 'symbol', 'gateway', 'status'],
  properties: {
    routeId: { type: 'string' },
    userId: { type: ['string', 'null'] },
    accountId: { type: ['string', 'null'] },
    providerId: { type: ['string', 'null'] },
    symbol: { type: 'string' },
    canonicalSymbol: { type: ['string', 'null'] },
    instrumentClass: { type: ['string', 'null'] },
    orderType: { type: ['string', 'null'] },
    direction: { type: ['string', 'null'] },
    gateway: { type: 'string' },
    status: { type: 'string', enum: Object.values(ROUTE_STATUS) },
    reason: { type: ['string', 'null'] },
    policyMode: { type: ['string', 'null'] },
    fallbackBehavior: { type: ['string', 'null'] },
    attempts: { type: 'array' },
    allowedGateways: { type: 'array', items: { type: 'string' } },
    latencyMs: { type: ['integer', 'null'] },
    createdAt: { type: 'string', format: 'date-time' },
  },
  additionalProperties: true,
});

function validateRouteDecision(payload) {
  const errors = [];

  if (!payload || typeof payload !== 'object') {
    return { valid: false, errors: ['route decision must be an object'] };
  }

  if (!payload.routeId) {
    errors.push('routeId is required');
  }
  if (!payload.symbol) {
    errors.push('symbol is required');
  }
  if (!payload.gateway) {
    errors.push('gateway is required');
  }
  if (!payload.status || !Object.values(ROUTE_STATUS).includes(payload.status)) {
    errors.push('status must be a supported route status');
  }

  return { valid: errors.length === 0, errors };
}

function describeRouteDecision(decision) {
  if (!decision) {
    return null;
  }
  return {
    routeId: decision.routeId,
    symbol: decision.symbol,
    gateway: decision.gateway,
    status: decision.status,
    reason: decision.reason,
    policyMode: decision.policyMode,
    instrumentClass: decision.instrumentClass,
    latencyMs: decision.latencyMs,
    attempts: Array.isArray(decision.attempts) ? decision.attempts.length : 0,
  };
}

module.exports = {
  ROUTE_STATUS,
  ROUTE_REASONS,
  ROUTE_DECISION_SCHEMA,
  validateRouteDecision,
  describeRouteDecision,
};