'use strict';

const gatewayInterface = require('./dex-gateway.interface');
const sharedConstants = require('./shared.constants');

const {
  EXECUTION_GATEWAYS,
  GATEWAY_METADATA,
} = require('../../routers/execution-router.constants');

const {
  config,
  isGatewayEnabled,
} = require('../../routers/execution-router.config');

const {
  SHARED_ERROR_CODES,
} = sharedConstants;

/**
 * SignalForge - Gateway Registry Service
 *
 * Registers every gateway, validates its interface, and resolves it
 * for a given request. The registry is lazy: gateways are loaded the
 * first time they are requested and cached for the lifetime of the
 * process.
 */

class GatewayNotRegisteredError extends Error {
  constructor(gateway) {
    super(`Gateway ${gateway} is not registered`);
    this.name = 'GatewayNotRegisteredError';
    this.code = SHARED_ERROR_CODES.GATEWAY_NOT_REGISTERED;
    this.gateway = gateway;
    this.isSharedDexError = true;
  }
}

class GatewayDisabledError extends Error {
  constructor(gateway) {
    super(`Gateway ${gateway} is disabled`);
    this.name = 'GatewayDisabledError';
    this.code = SHARED_ERROR_CODES.GATEWAY_DISABLED;
    this.gateway = gateway;
    this.isSharedDexError = true;
  }
}

const LOADERS = Object.freeze({
  [EXECUTION_GATEWAYS.METAAPI]: () => require('../../../execution/gateway/gateway.factory').getGateway('metaapi'),
  [EXECUTION_GATEWAYS.JUPITER]: () => require('../jupiter').gateway,
  [EXECUTION_GATEWAYS.RAYDIUM]: () => require('../raydium').gateway,
  [EXECUTION_GATEWAYS.ORCA]: () => require('../orca').gateway,
  [EXECUTION_GATEWAYS.HYPERLIQUID]: () => require('../hyperliquid').gateway,
  [EXECUTION_GATEWAYS.DRIFT]: () => require('../drift').gateway,
});

const cache = new Map();

function normalizeGatewayKey(key) {
  if (!key) {
    return null;
  }
  return String(key).trim().toLowerCase();
}

async function loadGateway(key) {
  const normalized = normalizeGatewayKey(key);
  if (!normalized) {
    throw new GatewayNotRegisteredError(key);
  }
  if (cache.has(normalized)) {
    return cache.get(normalized);
  }
  const loader = LOADERS[normalized];
  if (!loader) {
    throw new GatewayNotRegisteredError(normalized);
  }
  const gateway = await loader();
  cache.set(normalized, gateway);
  return gateway;
}

async function getGateway(key, { skipEnabledCheck = false } = {}) {
  const normalized = normalizeGatewayKey(key);
  if (!skipEnabledCheck && !isGatewayEnabled(normalized)) {
    throw new GatewayDisabledError(normalized);
  }
  const gateway = await loadGateway(normalized);
  gatewayInterface.validateGateway(gateway, { name: normalized });
  return gateway;
}

async function getGatewayOrNull(key) {
  try {
    return await getGateway(key);
  } catch (_error) {
    return null;
  }
}

async function getEnabledGateways() {
  const enabled = Object.entries(config.gateways)
    .filter(([, entry]) => entry.enabled)
    .map(([key]) => key);

  const result = [];
  for (const key of enabled) {
    const gateway = await getGatewayOrNull(key);
    if (gateway) {
      result.push({ key, gateway });
    }
  }
  return result;
}

async function loadAll() {
  const all = Object.values(EXECUTION_GATEWAYS);
  const loaded = {};
  for (const key of all) {
    loaded[key] = await getGatewayOrNull(key);
  }
  return loaded;
}

function describe(key) {
  const normalized = normalizeGatewayKey(key);
  const metadata = GATEWAY_METADATA[normalized];
  if (!metadata) {
    return null;
  }
  const gateway = cache.get(normalized) || null;
  const capabilities = gateway
    ? gatewayInterface.describeGateway(gateway, { name: normalized })
    : null;
  return {
    key: normalized,
    metadata,
    enabled: isGatewayEnabled(normalized),
    loaded: Boolean(gateway),
    capabilities,
  };
}

function describeAll() {
  return Object.keys(GATEWAY_METADATA).map((key) => describe(key));
}

function clearCache() {
  cache.clear();
}

function isRegistered(key) {
  const normalized = normalizeGatewayKey(key);
  return Boolean(LOADERS[normalized]);
}

module.exports = {
  GatewayNotRegisteredError,
  GatewayDisabledError,
  normalizeGatewayKey,
  loadGateway,
  getGateway,
  getGatewayOrNull,
  getEnabledGateways,
  loadAll,
  describe,
  describeAll,
  clearCache,
  isRegistered,
};