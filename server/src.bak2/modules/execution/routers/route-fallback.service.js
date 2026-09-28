'use strict';

const {
  EXECUTION_GATEWAYS,
  GATEWAY_TYPES,
  GATEWAY_METADATA,
} = require('./execution-router.constants');

const {
  NoGatewayAvailableError,
} = require('./execution-router.errors');

const {
  config,
  isGatewayEnabled,
} = require('./execution-router.config');

/**
 * SignalForge - Route Fallback Service
 *
 * Given a resolution and a gateway failure, decides which gateway to
 * try next. Fallback respects the configured behavior and the user's
 * allowed-gateway list so that a fallback never attempts a gateway the
 * user has blocked.
 */

function filterEnabled(gateways) {
  return gateways.filter((gateway) => isGatewayEnabled(gateway));
}

function filterByType(gateways, type) {
  return gateways.filter((gateway) => {
    const meta = GATEWAY_METADATA[gateway];
    return meta && meta.type === type;
  });
}

function orderAfter(gateways, currentGateway) {
  const index = gateways.indexOf(currentGateway);
  if (index < 0) {
    return [];
  }
  return gateways.slice(index + 1);
}

function resolveNextGateway({ resolution, failedGateway } = {}) {
  if (!resolution) {
    throw new NoGatewayAvailableError('Resolution is required to compute a fallback');
  }

  const behavior = config.fallbackBehavior;
  if (behavior === 'none') {
    return null;
  }

  const allowed = Array.isArray(resolution.allowedGateways) ? resolution.allowedGateways : [];
  const current = failedGateway || resolution.gateway;

  if (behavior === 'retry_next') {
    const next = orderAfter(allowed, current);
    return next[0] || null;
  }

  if (behavior === 'retry_broker') {
    const candidates = filterByType(allowed, GATEWAY_TYPES.BROKER);
    return candidates.find((gateway) => gateway !== current) || null;
  }

  if (behavior === 'retry_dex') {
    const candidates = filterByType(allowed, GATEWAY_TYPES.DEX);
    return candidates.find((gateway) => gateway !== current) || null;
  }

  if (behavior === 'retry_perp') {
    const candidates = filterByType(allowed, GATEWAY_TYPES.PERP);
    return candidates.find((gateway) => gateway !== current) || null;
  }

  return null;
}

function buildFallbackChain({ resolution, startingFrom } = {}) {
  if (!resolution) {
    return [];
  }
  const allowed = Array.isArray(resolution.allowedGateways) ? resolution.allowedGateways : [];
  const start = startingFrom || resolution.gateway;
  return orderAfter(allowed, start);
}

function canFallback({ resolution, attempts } = {}) {
  if (!resolution) {
    return false;
  }
  if (config.fallbackBehavior === 'none') {
    return false;
  }
  if (!Array.isArray(resolution.allowedGateways) || resolution.allowedGateways.length === 0) {
    return false;
  }
  const used = Array.isArray(attempts) ? attempts.map((entry) => entry.gateway) : [];
  const remaining = resolution.allowedGateways.filter((gateway) => !used.includes(gateway));
  return remaining.length > 0;
}

function describeFallback({ fromGateway, toGateway, reason }) {
  const fromMeta = GATEWAY_METADATA[fromGateway];
  const toMeta = GATEWAY_METADATA[toGateway];

  return {
    from: fromMeta ? fromMeta.displayName : fromGateway,
    to: toMeta ? toMeta.displayName : toGateway,
    reason: reason || 'gateway_unavailable',
  };
}

function resolveFallbackPath({ resolution, failedGateway } = {}) {
  const chain = buildFallbackChain({ resolution, startingFrom: failedGateway });
  const ordered = [];
  for (const gateway of chain) {
    const meta = GATEWAY_METADATA[gateway];
    if (!meta) {
      continue;
    }
    ordered.push({
      gateway,
      type: meta.type,
      displayName: meta.displayName,
    });
  }
  return ordered;
}

function pickBrokerFallback({ resolution } = {}) {
  if (!resolution) {
    return null;
  }
  const allowed = Array.isArray(resolution.allowedGateways) ? resolution.allowedGateways : [];
  const brokerCandidates = filterByType(allowed, GATEWAY_TYPES.BROKER);
  return brokerCandidates[0] || EXECUTION_GATEWAYS.METAAPI;
}

module.exports = {
  filterEnabled,
  filterByType,
  orderAfter,
  resolveNextGateway,
  buildFallbackChain,
  canFallback,
  describeFallback,
  resolveFallbackPath,
  pickBrokerFallback,
};