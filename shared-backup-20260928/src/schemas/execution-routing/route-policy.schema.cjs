'use strict';

/**
 * SignalForge - Route Policy Schema
 */

const ROUTE_POLICY_MODES = Object.freeze({
  AUTO: 'auto',
  BROKER_ONLY: 'broker_only',
  DEX_ONLY: 'dex_only',
  PERP_ONLY: 'perp_only',
  PREFER_BROKER: 'prefer_broker',
  PREFER_DEX: 'prefer_dex',
  PREFER_PERP: 'prefer_perp',
  MANUAL: 'manual',
});

const ROUTE_FALLBACK_BEHAVIOR = Object.freeze({
  NONE: 'none',
  RETRY_NEXT: 'retry_next',
  RETRY_BROKER: 'retry_broker',
  RETRY_DEX: 'retry_dex',
  RETRY_PERP: 'retry_perp',
});

const ROUTE_POLICY_LABELS = Object.freeze({
  auto: 'Automatic',
  broker_only: 'Broker Only',
  dex_only: 'DEX Only',
  perp_only: 'Perpetuals Only',
  prefer_broker: 'Prefer Broker',
  prefer_dex: 'Prefer DEX',
  prefer_perp: 'Prefer Perpetuals',
  manual: 'Manual',
});

const ROUTE_POLICY_SCHEMA = Object.freeze({
  type: 'object',
  required: ['mode'],
  properties: {
    id: { type: 'string' },
    userId: { type: 'string' },
    name: { type: 'string', minLength: 1, maxLength: 64 },
    mode: { type: 'string', enum: Object.values(ROUTE_POLICY_MODES) },
    fallbackBehavior: { type: 'string', enum: Object.values(ROUTE_FALLBACK_BEHAVIOR) },
    preferredGateway: { type: ['string', 'null'] },
    preferredInstrumentClass: { type: ['string', 'null'] },
    allowedGateways: { type: ['array', 'null'], items: { type: 'string' } },
    blockedGateways: { type: ['array', 'null'], items: { type: 'string' } },
    maxSlippageBps: { type: ['integer', 'null'], minimum: 1, maximum: 5000 },
    priorityFeesMicroLamports: { type: ['integer', 'null'], minimum: 0, maximum: 10000000 },
    isDefault: { type: 'boolean' },
    metadata: { type: 'object' },
  },
  additionalProperties: false,
});

function validateRoutePolicy(payload) {
  const errors = [];

  if (!payload || typeof payload !== 'object') {
    return { valid: false, errors: ['policy must be an object'] };
  }

  if (!payload.mode || !Object.values(ROUTE_POLICY_MODES).includes(payload.mode)) {
    errors.push('mode is required and must be supported');
  }

  if (
    payload.fallbackBehavior &&
    !Object.values(ROUTE_FALLBACK_BEHAVIOR).includes(payload.fallbackBehavior)
  ) {
    errors.push('fallbackBehavior must be supported');
  }

  if (payload.name !== undefined) {
    if (typeof payload.name !== 'string' || payload.name.length === 0 || payload.name.length > 64) {
      errors.push('name must be a string of 1 to 64 characters');
    }
  }

  if (payload.allowedGateways !== undefined && payload.allowedGateways !== null) {
    if (!Array.isArray(payload.allowedGateways)) {
      errors.push('allowedGateways must be an array');
    }
  }

  if (payload.blockedGateways !== undefined && payload.blockedGateways !== null) {
    if (!Array.isArray(payload.blockedGateways)) {
      errors.push('blockedGateways must be an array');
    }
  }

  if (payload.maxSlippageBps !== undefined && payload.maxSlippageBps !== null) {
    const numeric = Number(payload.maxSlippageBps);
    if (!Number.isFinite(numeric) || numeric < 1 || numeric > 5000) {
      errors.push('maxSlippageBps must be between 1 and 5000');
    }
  }

  return { valid: errors.length === 0, errors };
}

function buildRoutePolicy(payload) {
  return {
    id: payload.id || null,
    userId: payload.userId || null,
    name: payload.name || 'default',
    mode: payload.mode,
    fallbackBehavior: payload.fallbackBehavior || ROUTE_FALLBACK_BEHAVIOR.RETRY_NEXT,
    preferredGateway: payload.preferredGateway || null,
    preferredInstrumentClass: payload.preferredInstrumentClass || null,
    allowedGateways: payload.allowedGateways || null,
    blockedGateways: payload.blockedGateways || null,
    maxSlippageBps: payload.maxSlippageBps ?? null,
    priorityFeesMicroLamports: payload.priorityFeesMicroLamports ?? null,
    isDefault: payload.isDefault === true,
    metadata: payload.metadata || {},
  };
}

function describePolicyMode(mode) {
  return {
    mode,
    label: ROUTE_POLICY_LABELS[mode] || 'Unknown',
  };
}

function listPolicyModes() {
  return Object.values(ROUTE_POLICY_MODES).map((mode) => describePolicyMode(mode));
}

module.exports = {
  ROUTE_POLICY_MODES,
  ROUTE_FALLBACK_BEHAVIOR,
  ROUTE_POLICY_LABELS,
  ROUTE_POLICY_SCHEMA,
  validateRoutePolicy,
  buildRoutePolicy,
  describePolicyMode,
  listPolicyModes,
};