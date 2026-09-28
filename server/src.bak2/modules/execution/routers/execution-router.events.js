'use strict';

/**
 * SignalForge - Execution Router Event Definitions
 */

const ROUTE_EVENT_NAMES = Object.freeze({
  ROUTE_RESOLVED: 'execution.router.resolved',
  ROUTE_FALLBACK_TRIGGERED: 'execution.router.fallback',
  ROUTE_REJECTED: 'execution.router.rejected',
  ROUTE_SIMULATED: 'execution.router.simulated',
  ROUTE_POLICY_UPDATED: 'execution.router.policy.updated',
  GATEWAY_HEALTH_CHANGED: 'execution.router.gateway.health',
});

const ROUTE_EVENT_VERSION = 1;

function buildEventEnvelope(name, payload, metadata = {}) {
  return {
    name,
    version: ROUTE_EVENT_VERSION,
    emittedAt: new Date().toISOString(),
    payload,
    metadata: {
      source: 'execution-router',
      ...metadata,
    },
  };
}

function buildRouteResolvedEvent({
  userId,
  symbol,
  gateway,
  instrumentClass,
  reason,
  requestId,
}) {
  return buildEventEnvelope(ROUTE_EVENT_NAMES.ROUTE_RESOLVED, {
    userId: userId || null,
    symbol,
    gateway,
    instrumentClass,
    reason,
    requestId: requestId || null,
  });
}

function buildRouteFallbackEvent({
  userId,
  symbol,
  fromGateway,
  toGateway,
  reason,
  requestId,
}) {
  return buildEventEnvelope(ROUTE_EVENT_NAMES.ROUTE_FALLBACK_TRIGGERED, {
    userId: userId || null,
    symbol,
    fromGateway,
    toGateway,
    reason,
    requestId: requestId || null,
  });
}

function buildRouteRejectedEvent({ userId, symbol, reason, gateway, requestId }) {
  return buildEventEnvelope(ROUTE_EVENT_NAMES.ROUTE_REJECTED, {
    userId: userId || null,
    symbol,
    reason,
    gateway: gateway || null,
    requestId: requestId || null,
  });
}

function buildRouteSimulatedEvent({ userId, symbol, gateway, latencyMs, requestId }) {
  return buildEventEnvelope(ROUTE_EVENT_NAMES.ROUTE_SIMULATED, {
    userId: userId || null,
    symbol,
    gateway,
    latencyMs,
    requestId: requestId || null,
  });
}

function buildPolicyUpdatedEvent({ userId, policy, requestId }) {
  return buildEventEnvelope(ROUTE_EVENT_NAMES.ROUTE_POLICY_UPDATED, {
    userId,
    policy,
    requestId: requestId || null,
  });
}

function buildGatewayHealthEvent({ gateway, healthy, reason, requestId }) {
  return buildEventEnvelope(ROUTE_EVENT_NAMES.GATEWAY_HEALTH_CHANGED, {
    gateway,
    healthy,
    reason: reason || null,
    requestId: requestId || null,
  });
}

module.exports = {
  ROUTE_EVENT_NAMES,
  ROUTE_EVENT_VERSION,
  buildEventEnvelope,
  buildRouteResolvedEvent,
  buildRouteFallbackEvent,
  buildRouteRejectedEvent,
  buildRouteSimulatedEvent,
  buildPolicyUpdatedEvent,
  buildGatewayHealthEvent,
};