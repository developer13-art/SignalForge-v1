'use strict';

/**
 * SignalForge - Execution Router Constants
 *
 * Canonical constants for the hybrid execution engine. The router is
 * responsible for deciding, per symbol and per user, whether a trade
 * is routed through MetaApi (MT4/MT5) or through a Solana DEX gateway.
 */

const EXECUTION_GATEWAYS = Object.freeze({
  METAAPI: 'metaapi',
  JUPITER: 'jupiter',
  RAYDIUM: 'raydium',
  ORCA: 'orca',
  HYPERLIQUID: 'hyperliquid',
  DRIFT: 'drift',
});

const GATEWAY_TYPES = Object.freeze({
  BROKER: 'broker',
  DEX: 'dex',
  PERP: 'perp',
});

const GATEWAY_METADATA = Object.freeze({
  metaapi: {
    key: 'metaapi',
    type: GATEWAY_TYPES.BROKER,
    displayName: 'MetaApi (MT4/MT5)',
    supportsSpot: false,
    supportsFutures: true,
    supportsOptions: false,
    supportsPerps: false,
    supportsLimitOrders: true,
    supportsMarketOrders: true,
    supportsPartialClose: true,
    supportsTrailingStop: true,
    priority: 100,
  },
  jupiter: {
    key: 'jupiter',
    type: GATEWAY_TYPES.DEX,
    displayName: 'Jupiter Aggregator',
    supportsSpot: true,
    supportsFutures: false,
    supportsOptions: false,
    supportsPerps: false,
    supportsLimitOrders: true,
    supportsMarketOrders: true,
    supportsPartialClose: false,
    supportsTrailingStop: false,
    priority: 10,
  },
  raydium: {
    key: 'raydium',
    type: GATEWAY_TYPES.DEX,
    displayName: 'Raydium',
    supportsSpot: true,
    supportsFutures: false,
    supportsOptions: false,
    supportsPerps: false,
    supportsLimitOrders: true,
    supportsMarketOrders: true,
    supportsPartialClose: false,
    supportsTrailingStop: false,
    priority: 20,
  },
  orca: {
    key: 'orca',
    type: GATEWAY_TYPES.DEX,
    displayName: 'Orca',
    supportsSpot: true,
    supportsFutures: false,
    supportsOptions: false,
    supportsPerps: false,
    supportsLimitOrders: false,
    supportsMarketOrders: true,
    supportsPartialClose: false,
    supportsTrailingStop: false,
    priority: 30,
  },
  hyperliquid: {
    key: 'hyperliquid',
    type: GATEWAY_TYPES.PERP,
    displayName: 'Hyperliquid',
    supportsSpot: true,
    supportsFutures: true,
    supportsOptions: false,
    supportsPerps: true,
    supportsLimitOrders: true,
    supportsMarketOrders: true,
    supportsPartialClose: true,
    supportsTrailingStop: false,
    priority: 40,
  },
  drift: {
    key: 'drift',
    type: GATEWAY_TYPES.PERP,
    displayName: 'Drift Protocol',
    supportsSpot: false,
    supportsFutures: true,
    supportsOptions: false,
    supportsPerps: true,
    supportsLimitOrders: true,
    supportsMarketOrders: true,
    supportsPartialClose: true,
    supportsTrailingStop: false,
    priority: 50,
  },
});

const DEFAULT_DEX_PRIORITY = Object.freeze([
  EXECUTION_GATEWAYS.JUPITER,
  EXECUTION_GATEWAYS.RAYDIUM,
  EXECUTION_GATEWAYS.ORCA,
]);

const DEFAULT_PERP_PRIORITY = Object.freeze([
  EXECUTION_GATEWAYS.HYPERLIQUID,
  EXECUTION_GATEWAYS.DRIFT,
]);

const INSTRUMENT_CLASSES = Object.freeze({
  FOREX: 'forex',
  METALS: 'metals',
  INDICES: 'indices',
  COMMODITIES: 'commodities',
  CRYPTO_SPOT: 'crypto_spot',
  CRYPTO_PERP: 'crypto_perp',
  CRYPTO_LP: 'crypto_lp',
  STABLECOIN: 'stablecoin',
  UNKNOWN: 'unknown',
});

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

const ROUTE_LOG_ACTIONS = Object.freeze({
  RESOLVED: 'resolved',
  FELL_BACK: 'fell_back',
  REJECTED: 'rejected',
  SIMULATED: 'simulated',
});

const ROUTE_METRICS = Object.freeze({
  ROUTES_RESOLVED: 'execution_router_routes_resolved_total',
  ROUTES_FALLBACK: 'execution_router_routes_fallback_total',
  ROUTES_REJECTED: 'execution_router_routes_rejected_total',
  LATENCY_MS: 'execution_router_latency_ms',
});

const ROUTE_LOG_CONTEXT = 'execution-router';

const ROUTE_MAX_LATENCY_MS = 5000;

const ROUTE_DEFAULT_COMMITMENT = 'confirmed';

module.exports = Object.freeze({
  EXECUTION_GATEWAYS,
  GATEWAY_TYPES,
  GATEWAY_METADATA,
  DEFAULT_DEX_PRIORITY,
  DEFAULT_PERP_PRIORITY,
  INSTRUMENT_CLASSES,
  ROUTE_STATUS,
  ROUTE_REASONS,
  ROUTE_POLICY_MODES,
  ROUTE_FALLBACK_BEHAVIOR,
  ROUTE_LOG_ACTIONS,
  ROUTE_METRICS,
  ROUTE_LOG_CONTEXT,
  ROUTE_MAX_LATENCY_MS,
  ROUTE_DEFAULT_COMMITMENT,
});