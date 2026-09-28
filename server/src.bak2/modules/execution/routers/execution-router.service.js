'use strict';

const routeResolver = require('./route-resolver.service');
const routePolicyService = require('./route-policy.service');
const routeFallbackService = require('./route-fallback.service');
const routeLogger = require('./route-logger.service');
const routeMetrics = require('./route-metrics.service');
const routeSimulator = require('./route-simulator.service');
const routePolicyRepository = require('./route-policy.repository');
const instrumentClass = require('./instrument-class.service');

const {
  ROUTE_STATUS,
  ROUTE_REASONS,
} = require('./execution-router.constants');

const {
  config,
} = require('./execution-router.config');

const {
  ServiceUnavailableError,
  isExecutionRouterError,
} = require('./execution-router.errors');

const {
  buildRouteResolvedEvent,
  buildRouteFallbackEvent,
  buildRouteRejectedEvent,
  buildPolicyUpdatedEvent,
} = require('./execution-router.events');

/**
 * SignalForge - Execution Router Service
 *
 * The single entry point for the execution router. Everything else in
 * the platform calls into this service to decide which gateway should
 * execute a trade. The service is safe to call from the trading
 * pipeline, from user-facing APIs, and from the scheduler.
 */

function emitEvent(name, payload) {
  const bus = global.__signalforgeEventBus;
  if (bus && typeof bus.publish === 'function') {
    bus.publish(name, payload);
  }
}

function ensureEnabled() {
  if (!config.enabled) {
    throw new ServiceUnavailableError('Execution router is disabled');
  }
}

async function resolveRoute({ payload, context = {}, persist = true, requestId = null }) {
  ensureEnabled();

  const started = Date.now();

  const resolution = await routeResolver.resolve({ payload, context });

  const elapsed = Date.now() - started;
  resolution.latencyMs = elapsed;

  routeMetrics.recordResolution({ gateway: resolution.gateway, latencyMs: elapsed });

  if (persist && config.logging.logResolutions) {
    try {
      await routeLogger.recordRoute({
        resolution,
        userId: payload.userId || null,
        providerId: payload.providerId || null,
        accountId: payload.accountId || null,
        signalId: payload.signalId || null,
        tradeId: payload.tradeId || null,
        requestId,
      });
    } catch (_error) {
      // Logging must never break execution.
    }
  }

  emitEvent(
    'execution.router.resolved',
    buildRouteResolvedEvent({
      userId: payload.userId || null,
      symbol: resolution.symbol,
      gateway: resolution.gateway,
      instrumentClass: resolution.instrumentClass,
      reason: resolution.reason,
      requestId,
    }).payload,
  );

  return resolution;
}

async function resolveFallback({ resolution, failedGateway, requestId = null }) {
  ensureEnabled();

  if (!resolution) {
    throw new ServiceUnavailableError('A resolution is required to compute a fallback');
  }

  const nextGateway = routeFallbackService.resolveNextGateway({
    resolution,
    failedGateway,
  });

  if (!nextGateway) {
    if (config.logging.logRejections) {
      try {
        await routeLogger.recordRejection({
          routeId: resolution.routeId,
          gateway: failedGateway,
          reason: ROUTE_REASONS.GATEWAY_UNAVAILABLE,
        });
      } catch (_error) {
        // Logging must never break execution.
      }
    }

    emitEvent(
      'execution.router.rejected',
      buildRouteRejectedEvent({
        userId: resolution.userId || null,
        symbol: resolution.symbol,
        reason: ROUTE_REASONS.GATEWAY_UNAVAILABLE,
        gateway: failedGateway,
        requestId,
      }).payload,
    );

    return null;
  }

  routeMetrics.recordFallback({ fromGateway: failedGateway, toGateway: nextGateway });

  if (config.logging.logFallbacks) {
    try {
      await routeLogger.recordFallback({
        routeId: resolution.routeId,
        fromGateway: failedGateway,
        toGateway: nextGateway,
        reason: ROUTE_REASONS.GATEWAY_UNAVAILABLE,
      });
    } catch (_error) {
      // Logging must never break execution.
    }
  }

  emitEvent(
    'execution.router.fallback',
    buildRouteFallbackEvent({
      userId: resolution.userId || null,
      symbol: resolution.symbol,
      fromGateway: failedGateway,
      toGateway: nextGateway,
      reason: ROUTE_REASONS.GATEWAY_UNAVAILABLE,
      requestId,
    }).payload,
  );

  return {
    ...resolution,
    previousGateway: failedGateway,
    gateway: nextGateway,
    status: ROUTE_STATUS.FALLBACK,
    reason: ROUTE_REASONS.GATEWAY_UNAVAILABLE,
  };
}

async function resolveRouteWithFallback({ payload, context = {}, requestId = null }) {
  const resolution = await resolveRoute({ payload, context, requestId });
  const chain = routeFallbackService.buildFallbackChain({ resolution });
  return {
    ...resolution,
    chain,
  };
}

async function simulateRoute({ payload, context = {} }) {
  ensureEnabled();
  const result = await routeSimulator.simulate({ payload, context });

  if (config.logging.logResolutions) {
    try {
      await routeLogger.recordSimulation({
        routeId: result.routeId,
        latencyMs: result.latencyMs,
        payload: {
          symbol: result.symbol,
          gateway: result.gateway,
        },
      });
    } catch (_error) {
      // Logging must never break simulation.
    }
  }

  return result;
}

async function explainRoute({ symbol, payload = {}, context = {} }) {
  ensureEnabled();
  return routeSimulator.explain({ symbol, payload, context });
}

async function getPolicyForUser(userId) {
  ensureEnabled();
  return routePolicyService.getPolicyForUser(userId);
}

async function listPolicies(userId) {
  ensureEnabled();
  return routePolicyService.listPolicies(userId);
}

async function savePolicy({ userId, payload, requestId = null }) {
  ensureEnabled();
  const policy = await routePolicyService.savePolicy({ userId, payload });

  emitEvent(
    'execution.router.policy.updated',
    buildPolicyUpdatedEvent({
      userId,
      policy,
      requestId,
    }).payload,
  );

  return policy;
}

async function deletePolicy({ id, userId }) {
  ensureEnabled();
  return routePolicyService.deletePolicy({ id, userId });
}

async function setDefaultPolicy({ policyId, userId }) {
  ensureEnabled();
  return routePolicyService.setDefaultPolicy({ policyId, userId });
}

async function listRoutes({ filters, pagination }) {
  ensureEnabled();
  return routeLogger.listRoutesForUser(filters, pagination);
}

async function getRoute(routeId) {
  ensureEnabled();
  return routeLogger.getRouteById(routeId);
}

async function listLogs(routeId, options) {
  ensureEnabled();
  return routeLogger.listLogsForRoute(routeId, options);
}

async function aggregateUsage({ from, to } = {}) {
  ensureEnabled();
  return routeLogger.aggregateUsage({ from, to });
}

async function getMetricsSnapshot() {
  ensureEnabled();
  return routeMetrics.summarize();
}

async function listSupportedGateways() {
  ensureEnabled();
  return routeSimulator.listSupportedGatewayMatrix();
}

function classifySymbol(symbol) {
  return instrumentClass.classify(symbol);
}

function isRouterError(error) {
  return isExecutionRouterError(error);
}

module.exports = {
  resolveRoute,
  resolveFallback,
  resolveRouteWithFallback,
  simulateRoute,
  explainRoute,
  getPolicyForUser,
  listPolicies,
  savePolicy,
  deletePolicy,
  setDefaultPolicy,
  listRoutes,
  getRoute,
  listLogs,
  aggregateUsage,
  getMetricsSnapshot,
  listSupportedGateways,
  classifySymbol,
  isRouterError,
  ensureEnabled,
};