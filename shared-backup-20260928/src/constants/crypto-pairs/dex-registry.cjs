'use strict';

/**
 * SignalForge - DEX Registry
 *
 * Canonical registry of the decentralized exchanges supported by the
 * hybrid execution engine. Used by the frontend to render DEX
 * selectors and by the backend to validate gateway identifiers.
 */

const DEX_GATEWAYS = Object.freeze({
  JUPITER: 'jupiter',
  RAYDIUM: 'raydium',
  ORCA: 'orca',
  HYPERLIQUID: 'hyperliquid',
  DRIFT: 'drift',
});

const DEX_REGISTRY = Object.freeze({
  jupiter: {
    key: 'jupiter',
    displayName: 'Jupiter',
    description: 'Leading Solana DEX aggregator with deep liquidity across all major pairs.',
    type: 'dex',
    network: 'solana',
    supportsSpot: true,
    supportsPerps: false,
    supportsLimitOrders: true,
    supportsPartialClose: false,
    supportsTrailingStop: false,
    priority: 10,
    logo: '/assets/dex/jupiter.svg',
    website: 'https://jup.ag',
  },
  raydium: {
    key: 'raydium',
    displayName: 'Raydium',
    description: 'Solana AMM with concentrated liquidity pools and hybrid order routing.',
    type: 'dex',
    network: 'solana',
    supportsSpot: true,
    supportsPerps: false,
    supportsLimitOrders: true,
    supportsPartialClose: false,
    supportsTrailingStop: false,
    priority: 20,
    logo: '/assets/dex/raydium.svg',
    website: 'https://raydium.io',
  },
  orca: {
    key: 'orca',
    displayName: 'Orca',
    description: 'Solana concentrated liquidity AMM known for capital efficiency and simplicity.',
    type: 'dex',
    network: 'solana',
    supportsSpot: true,
    supportsPerps: false,
    supportsLimitOrders: false,
    supportsPartialClose: false,
    supportsTrailingStop: false,
    priority: 30,
    logo: '/assets/dex/orca.svg',
    website: 'https://orca.so',
  },
  hyperliquid: {
    key: 'hyperliquid',
    displayName: 'Hyperliquid',
    description: 'On-chain perpetuals exchange with sub-second finality and deep order books.',
    type: 'perp',
    network: 'hyperliquid',
    supportsSpot: true,
    supportsPerps: true,
    supportsLimitOrders: true,
    supportsPartialClose: true,
    supportsTrailingStop: false,
    priority: 40,
    logo: '/assets/dex/hyperliquid.svg',
    website: 'https://hyperliquid.xyz',
  },
  drift: {
    key: 'drift',
    displayName: 'Drift Protocol',
    description: 'Solana-based perpetuals DEX with cross-margined accounts and deep liquidity.',
    type: 'perp',
    network: 'solana',
    supportsSpot: false,
    supportsPerps: true,
    supportsLimitOrders: true,
    supportsPartialClose: true,
    supportsTrailingStop: false,
    priority: 50,
    logo: '/assets/dex/drift.svg',
    website: 'https://drift.trade',
  },
});

const DEFAULT_DEX_PRIORITY = Object.freeze([
  DEX_GATEWAYS.JUPITER,
  DEX_GATEWAYS.RAYDIUM,
  DEX_GATEWAYS.ORCA,
]);

const DEFAULT_PERP_PRIORITY = Object.freeze([
  DEX_GATEWAYS.HYPERLIQUID,
  DEX_GATEWAYS.DRIFT,
]);

function listDexes() {
  return Object.values(DEX_REGISTRY).filter((entry) => entry.type === 'dex');
}

function listPerps() {
  return Object.values(DEX_REGISTRY).filter((entry) => entry.type === 'perp');
}

function listAllGateways() {
  return Object.values(DEX_REGISTRY);
}

function findGateway(key) {
  if (!key) {
    return null;
  }
  const normalized = String(key).trim().toLowerCase();
  return DEX_REGISTRY[normalized] || null;
}

function isDex(key) {
  const gateway = findGateway(key);
  return Boolean(gateway && gateway.type === 'dex');
}

function isPerp(key) {
  const gateway = findGateway(key);
  return Boolean(gateway && gateway.type === 'perp');
}

function listGatewaysForPair({ canonicalPair } = {}) {
  if (!canonicalPair) {
    return listAllGateways();
  }
  const upper = String(canonicalPair).toUpperCase();
  const isPerpPair = upper.endsWith('-PERP');

  if (isPerpPair) {
    return listPerps();
  }

  return listDexes();
}

module.exports = Object.freeze({
  DEX_GATEWAYS,
  DEX_REGISTRY,
  DEFAULT_DEX_PRIORITY,
  DEFAULT_PERP_PRIORITY,
  listDexes,
  listPerps,
  listAllGateways,
  findGateway,
  isDex,
  isPerp,
  listGatewaysForPair,
});