'use strict';

const routeResolver = require('./route-resolver.service');
const routePolicyService = require('./route-policy.service');
const instrumentClass = require('./instrument-class.service');

const {
  GATEWAY_METADATA,
  INSTRUMENT_CLASSES,
} = require('./execution-router.constants');

const {
  config,
} = require('./execution-router.config');

/**
 * SignalForge - Route Simulator Service
 *
 * Provides a side-effect-free resolution preview so that the frontend
 * can show the user which gateway would execute a given signal before
 * they commit. The simulator never contacts a gateway.
 */

async function simulate({ payload, context = {} }) {
  const started = Date.now();
  const resolution = await routeResolver.resolve({ payload, context });
  const elapsed = Date.now() - started;

  const gatewayMeta = GATEWAY_METADATA[resolution.gateway] || {};

  return {
    ...resolution,
    gatewayDisplayName: gatewayMeta.displayName || resolution.gateway,
    gatewayType: gatewayMeta.type || null,
    supportsLimitOrders: gatewayMeta.supportsLimitOrders === true,
    supportsPartialClose: gatewayMeta.supportsPartialClose === true,
    supportsTrailingStop: gatewayMeta.supportsTrailingStop === true,
    latencyMs: elapsed,
    simulated: true,
  };
}

async function simulateBatch({ items, context = {} } = {}) {
  if (!Array.isArray(items) || items.length === 0) {
    return { results: [] };
  }

  const results = [];
  for (const item of items) {
    try {
      const result = await simulate({ payload: item, context });
      results.push({ success: true, resolution: result });
    } catch (error) {
      results.push({
        success: false,
        error: error.message,
        code: error.code || 'ROUTE_RESOLUTION_FAILED',
        input: item,
      });
    }
  }

  return { results };
}

async function explain({ symbol, payload = {}, context = {} } = {}) {
  const classification = instrumentClass.classify(symbol);

  const policy = await routePolicyService.resolvePolicyForUser({
    userId: payload.userId || context.userId || null,
    overridePolicy: context.overridePolicy,
  });

  const preferred = instrumentClass.preferGateway(classification.instrumentClass);

  let resolution = null;
  let error = null;

  try {
    resolution = await simulate({
      payload: { ...payload, symbol },
      context,
    });
  } catch (err) {
    error = { message: err.message, code: err.code || 'ROUTE_RESOLUTION_FAILED' };
  }

  return {
    symbol,
    classification: {
      instrumentClass: classification.instrumentClass,
      base: classification.base,
      quote: classification.quote,
      isPerp: classification.isPerp,
      isCrypto: classification.isCrypto,
      description: instrumentClass.describe(classification.instrumentClass),
    },
    policy: {
      mode: policy.mode,
      fallback: policy.fallbackBehavior,
      preferredGateway: policy.preferredGateway || null,
      preferredInstrumentClass: policy.preferredInstrumentClass || null,
    },
    preferredGatewayByClass: preferred,
    configDefaults: {
      defaultMode: config.defaultMode,
      fallbackBehavior: config.fallbackBehavior,
      dexPriority: config.dexPriority,
      perpPriority: config.perpPriority,
    },
    resolution,
    error,
    supportedInstrumentClasses: Object.values(INSTRUMENT_CLASSES),
  };
}

function listSupportedGatewayMatrix() {
  return Object.values(GATEWAY_METADATA).map((meta) => ({
    gateway: meta.key,
    type: meta.type,
    displayName: meta.displayName,
    supportsSpot: meta.supportsSpot,
    supportsFutures: meta.supportsFutures,
    supportsPerps: meta.supportsPerps,
    supportsLimitOrders: meta.supportsLimitOrders,
    supportsMarketOrders: meta.supportsMarketOrders,
    supportsPartialClose: meta.supportsPartialClose,
    supportsTrailingStop: meta.supportsTrailingStop,
    priority: meta.priority,
  }));
}

module.exports = {
  simulate,
  simulateBatch,
  explain,
  listSupportedGatewayMatrix,
};