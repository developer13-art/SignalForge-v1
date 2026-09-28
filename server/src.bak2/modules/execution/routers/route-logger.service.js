'use strict';

const crypto = require('crypto');

const executionRouterRepository = require('./execution-router.repository');

const {
  ROUTE_LOG_ACTIONS,
  ROUTE_LOG_CONTEXT,
} = require('./execution-router.constants');

/**
 * SignalForge - Route Logger Service
 *
 * Persists route decisions and their logs. Logging is intentionally
 * additive: every attempt writes a new row so that a partial fallback
 * chain remains fully reconstructable for auditing and debugging.
 */

function generateLogId() {
  return `rlog_${crypto.randomBytes(10).toString('hex')}`;
}

function resolveLogger() {
  if (global.__signalforgeLogger && typeof global.__signalforgeLogger.info === 'function') {
    return global.__signalforgeLogger;
  }
  return null;
}

async function recordRoute({ resolution, userId, providerId, accountId, signalId, tradeId, requestId }) {
  if (!resolution) {
    return null;
  }

  const route = await executionRouterRepository.createRoute(null, {
    id: resolution.routeId,
    userId,
    providerId,
    accountId,
    signalId,
    tradeId,
    symbol: resolution.symbol,
    instrumentClass: resolution.instrumentClass,
    orderType: resolution.orderType,
    direction: resolution.direction,
    resolvedGateway: resolution.gateway,
    fallbackGateway: null,
    status: resolution.status,
    reason: resolution.reason,
    policyId: resolution.policyId || null,
    policyMode: resolution.policyMode,
    requestId,
    attempt: resolution.attempts ? resolution.attempts.length : 1,
    latencyMs: resolution.latencyMs || null,
    metadata: {
      attempts: resolution.attempts || [],
      base: resolution.base || null,
      quote: resolution.quote || null,
      isPerp: resolution.isPerp === true,
      isCrypto: resolution.isCrypto === true,
    },
  });

  await recordLog({
    routeId: resolution.routeId,
    action: ROUTE_LOG_ACTIONS.RESOLVED,
    message: `Resolved to ${resolution.gateway}`,
    payload: {
      symbol: resolution.symbol,
      gateway: resolution.gateway,
      status: resolution.status,
      reason: resolution.reason,
    },
  });

  const logger = resolveLogger();
  if (logger) {
    logger.info(
      {
        context: ROUTE_LOG_CONTEXT,
        routeId: resolution.routeId,
        symbol: resolution.symbol,
        gateway: resolution.gateway,
        status: resolution.status,
        policyMode: resolution.policyMode,
      },
      'Route resolved',
    );
  }

  return route;
}

async function recordLog({ routeId, action, message, payload }) {
  return executionRouterRepository.createLog(null, {
    id: generateLogId(),
    routeId,
    action,
    message,
    payload: payload || {},
  });
}

async function recordFallback({ routeId, fromGateway, toGateway, reason }) {
  return recordLog({
    routeId,
    action: ROUTE_LOG_ACTIONS.FELL_BACK,
    message: `Fell back from ${fromGateway} to ${toGateway}`,
    payload: { fromGateway, toGateway, reason: reason || null },
  });
}

async function recordRejection({ routeId, gateway, reason, details }) {
  return recordLog({
    routeId,
    action: ROUTE_LOG_ACTIONS.REJECTED,
    message: `Rejected${gateway ? ` on ${gateway}` : ''}: ${reason}`,
    payload: { gateway: gateway || null, reason, details: details || null },
  });
}

async function recordSimulation({ routeId, latencyMs, payload }) {
  return recordLog({
    routeId,
    action: ROUTE_LOG_ACTIONS.SIMULATED,
    message: `Simulated in ${latencyMs}ms`,
    payload: { latencyMs, ...payload },
  });
}

async function listLogsForRoute(routeId, options) {
  return executionRouterRepository.listLogsByRoute(routeId, options);
}

async function listRoutesForUser(filters, pagination) {
  return executionRouterRepository.listRoutes(filters, pagination);
}

async function getRouteById(routeId) {
  return executionRouterRepository.findRouteById(routeId);
}

async function aggregateUsage({ from, to }) {
  return executionRouterRepository.aggregateGatewayUsage({ from, to });
}

module.exports = {
  recordRoute,
  recordLog,
  recordFallback,
  recordRejection,
  recordSimulation,
  listLogsForRoute,
  listRoutesForUser,
  getRouteById,
  aggregateUsage,
  generateLogId,
};