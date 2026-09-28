'use strict';

const { ROUTE_METRICS } = require('./execution-router.constants');
const { config } = require('./execution-router.config');

/**
 * SignalForge - Route Metrics Service
 *
 * Lightweight metrics accumulator for the execution router. Metrics
 * are emitted to the process-wide metrics registry when available and
 * otherwise retained in process memory for periodic flushing.
 */

const inMemory = {
  routesResolved: 0,
  routesFallback: 0,
  routesRejected: 0,
  latencySamples: [],
  gatewayCounts: {},
};

function resolveRegistry() {
  if (global.__signalforgeMetrics && typeof global.__signalforgeMetrics.increment === 'function') {
    return global.__signalforgeMetrics;
  }
  return null;
}

function observe(name, value, tags = {}) {
  if (!config.metrics.enabled) {
    return;
  }
  const registry = resolveRegistry();
  if (registry && typeof registry.observe === 'function') {
    registry.observe(name, value, tags);
  }
}

function increment(name, tags = {}) {
  if (!config.metrics.enabled) {
    return;
  }
  const registry = resolveRegistry();
  if (registry && typeof registry.increment === 'function') {
    registry.increment(name, tags);
  }
}

function recordResolution({ gateway, latencyMs }) {
  inMemory.routesResolved += 1;
  inMemory.gatewayCounts[gateway] = (inMemory.gatewayCounts[gateway] || 0) + 1;
  if (typeof latencyMs === 'number') {
    inMemory.latencySamples.push(latencyMs);
    if (inMemory.latencySamples.length > 500) {
      inMemory.latencySamples.shift();
    }
    observe(ROUTE_METRICS.LATENCY_MS, latencyMs, { gateway });
  }
  increment(ROUTE_METRICS.ROUTES_RESOLVED, { gateway });
}

function recordFallback({ fromGateway, toGateway }) {
  inMemory.routesFallback += 1;
  increment(ROUTE_METRICS.ROUTES_FALLBACK, { from: fromGateway, to: toGateway });
}

function recordRejection({ gateway, reason }) {
  inMemory.routesRejected += 1;
  increment(ROUTE_METRICS.ROUTES_REJECTED, { gateway: gateway || 'unknown', reason });
}

function summarize() {
  const samples = inMemory.latencySamples;
  const average =
    samples.length > 0 ? samples.reduce((sum, value) => sum + value, 0) / samples.length : 0;
  const max = samples.length > 0 ? Math.max(...samples) : 0;
  const min = samples.length > 0 ? Math.min(...samples) : 0;

  return {
    routesResolved: inMemory.routesResolved,
    routesFallback: inMemory.routesFallback,
    routesRejected: inMemory.routesRejected,
    latency: {
      samples: samples.length,
      averageMs: Math.round(average * 100) / 100,
      minMs: min,
      maxMs: max,
    },
    gatewayCounts: { ...inMemory.gatewayCounts },
  };
}

function reset() {
  inMemory.routesResolved = 0;
  inMemory.routesFallback = 0;
  inMemory.routesRejected = 0;
  inMemory.latencySamples = [];
  inMemory.gatewayCounts = {};
}

module.exports = {
  recordResolution,
  recordFallback,
  recordRejection,
  summarize,
  reset,
  observe,
  increment,
};