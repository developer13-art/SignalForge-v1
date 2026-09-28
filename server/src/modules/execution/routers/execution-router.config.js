'use strict';

const { EXECUTION_GATEWAYS } = require('./execution-router.constants');

/**
 * SignalForge - Execution Router Configuration
 *
 * Loads and validates configuration for the hybrid execution router.
 * Configuration is entirely environment-driven so that operators can
 * enable or disable gateways without a redeploy.
 */

function optionalEnv(key, fallback = undefined) {
  const value = process.env[key];
  if (value === undefined || value === null || String(value).trim() === '') {
    return fallback;
  }
  return String(value).trim();
}

function optionalBool(key, fallback = false) {
  const value = optionalEnv(key);
  if (value === undefined) {
    return fallback;
  }
  const normalized = value.toLowerCase();
  if (['true', '1', 'yes', 'on'].includes(normalized)) {
    return true;
  }
  if (['false', '0', 'no', 'off'].includes(normalized)) {
    return false;
  }
  return fallback;
}

function optionalInt(key, fallback) {
  const value = optionalEnv(key);
  if (value === undefined) {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    return fallback;
  }
  return parsed;
}

function optionalList(key, fallback = []) {
  const value = optionalEnv(key);
  if (value === undefined) {
    return fallback;
  }
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

const config = {
  enabled: optionalBool('EXECUTION_ROUTER_ENABLED', true),

  defaultMode: optionalEnv('EXECUTION_ROUTER_DEFAULT_MODE', 'auto'),

  fallbackBehavior: optionalEnv('EXECUTION_ROUTER_FALLBACK_BEHAVIOR', 'retry_next'),

  gateways: {
    metaapi: {
      enabled: optionalBool('EXECUTION_ROUTER_METAAPI_ENABLED', true),
      priority: optionalInt('EXECUTION_ROUTER_METAAPI_PRIORITY', 100),
    },
    jupiter: {
      enabled: optionalBool('EXECUTION_ROUTER_JUPITER_ENABLED', true),
      priority: optionalInt('EXECUTION_ROUTER_JUPITER_PRIORITY', 10),
      apiKey: optionalEnv('JUPITER_API_KEY', ''),
      baseUrl: optionalEnv('JUPITER_BASE_URL', 'https://lite-api.jup.ag'),
    },
    raydium: {
      enabled: optionalBool('EXECUTION_ROUTER_RAYDIUM_ENABLED', true),
      priority: optionalInt('EXECUTION_ROUTER_RAYDIUM_PRIORITY', 20),
      baseUrl: optionalEnv('RAYDIUM_BASE_URL', 'https://transaction-v1.raydium.io'),
    },
    orca: {
      enabled: optionalBool('EXECUTION_ROUTER_ORCA_ENABLED', true),
      priority: optionalInt('EXECUTION_ROUTER_ORCA_PRIORITY', 30),
      baseUrl: optionalEnv('ORCA_BASE_URL', 'https://api.orca.so'),
    },
    hyperliquid: {
      enabled: optionalBool('EXECUTION_ROUTER_HYPERLIQUID_ENABLED', false),
      priority: optionalInt('EXECUTION_ROUTER_HYPERLIQUID_PRIORITY', 40),
      baseUrl: optionalEnv('HYPERLIQUID_BASE_URL', 'https://api.hyperliquid.xyz'),
      wsUrl: optionalEnv('HYPERLIQUID_WS_URL', 'wss://api.hyperliquid.xyz/ws'),
    },
    drift: {
      enabled: optionalBool('EXECUTION_ROUTER_DRIFT_ENABLED', false),
      priority: optionalInt('EXECUTION_ROUTER_DRIFT_PRIORITY', 50),
      baseUrl: optionalEnv('DRIFT_BASE_URL', 'https://dlob.drift.trade'),
    },
  },

  dexPriority: optionalList('EXECUTION_ROUTER_DEX_PRIORITY', [
    EXECUTION_GATEWAYS.JUPITER,
    EXECUTION_GATEWAYS.RAYDIUM,
    EXECUTION_GATEWAYS.ORCA,
  ]),

  perpPriority: optionalList('EXECUTION_ROUTER_PERP_PRIORITY', [
    EXECUTION_GATEWAYS.HYPERLIQUID,
    EXECUTION_GATEWAYS.DRIFT,
  ]),

  symbolOverrides: {
    broker: optionalList('EXECUTION_ROUTER_BROKER_SYMBOLS', []),
    dex: optionalList('EXECUTION_ROUTER_DEX_SYMBOLS', []),
    perp: optionalList('EXECUTION_ROUTER_PERP_SYMBOLS', []),
  },

  policy: {
    allowUserOverride: optionalBool('EXECUTION_ROUTER_ALLOW_USER_OVERRIDE', true),
    allowSystemFallback: optionalBool('EXECUTION_ROUTER_ALLOW_SYSTEM_FALLBACK', true),
    requireKycForDex: optionalBool('EXECUTION_ROUTER_REQUIRE_KYC_FOR_DEX', true),
    requireKycForPerp: optionalBool('EXECUTION_ROUTER_REQUIRE_KYC_FOR_PERP', true),
  },

  logging: {
    logResolutions: optionalBool('EXECUTION_ROUTER_LOG_RESOLUTIONS', true),
    logFallbacks: optionalBool('EXECUTION_ROUTER_LOG_FALLBACKS', true),
    logRejections: optionalBool('EXECUTION_ROUTER_LOG_REJECTIONS', true),
  },

  metrics: {
    enabled: optionalBool('EXECUTION_ROUTER_METRICS_ENABLED', true),
    sampleRate: optionalInt('EXECUTION_ROUTER_METRICS_SAMPLE_RATE', 100),
  },

  timeouts: {
    resolutionMs: optionalInt('EXECUTION_ROUTER_RESOLUTION_TIMEOUT_MS', 5000),
    simulationMs: optionalInt('EXECUTION_ROUTER_SIMULATION_TIMEOUT_MS', 10000),
  },
};

function validateConfig() {
  const errors = [];

  if (config.enabled) {
    const anyGatewayEnabled = Object.values(config.gateways).some((gateway) => gateway.enabled);
    if (!anyGatewayEnabled) {
      errors.push('At least one execution gateway must be enabled');
    }
  }

  const allowedModes = ['auto', 'broker_only', 'dex_only', 'perp_only', 'prefer_broker', 'prefer_dex', 'prefer_perp', 'manual'];
  if (!allowedModes.includes(config.defaultMode)) {
    errors.push(`EXECUTION_ROUTER_DEFAULT_MODE must be one of: ${allowedModes.join(', ')}`);
  }

  const allowedFallback = ['none', 'retry_next', 'retry_broker', 'retry_dex', 'retry_perp'];
  if (!allowedFallback.includes(config.fallbackBehavior)) {
    errors.push(`EXECUTION_ROUTER_FALLBACK_BEHAVIOR must be one of: ${allowedFallback.join(', ')}`);
  }

  if (errors.length > 0) {
    throw new Error(`[execution-router] Configuration validation failed:\n - ${errors.join('\n - ')}`);
  }

  return true;
}

function isGatewayEnabled(key) {
  return Boolean(config.gateways[key] && config.gateways[key].enabled);
}

function listEnabledGateways() {
  return Object.entries(config.gateways)
    .filter(([, gateway]) => gateway.enabled)
    .map(([key]) => key);
}

module.exports = {
  config,
  validateConfig,
  isGatewayEnabled,
  listEnabledGateways,
};