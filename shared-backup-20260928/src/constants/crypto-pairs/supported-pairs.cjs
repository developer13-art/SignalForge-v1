'use strict';

/**
 * SignalForge - Supported Crypto Pairs
 *
 * Canonical list of crypto pairs that SignalForge recognizes and
 * routes across the platform. Kept in the shared package so that
 * frontend and backend agree on the same set.
 */

const SUPPORTED_SPOT_PAIRS = Object.freeze([
  'BTC/USDT',
  'BTC/USDC',
  'BTC/USD',
  'ETH/USDT',
  'ETH/USDC',
  'ETH/USD',
  'SOL/USDT',
  'SOL/USDC',
  'SOL/USD',
  'BNB/USDT',
  'XRP/USDT',
  'ADA/USDT',
  'DOGE/USDT',
  'AVAX/USDT',
  'DOT/USDT',
  'POL/USDT',
  'LINK/USDT',
  'UNI/USDT',
  'ATOM/USDT',
  'LTC/USDT',
  'BCH/USDT',
  'NEAR/USDT',
  'APT/USDT',
  'ARB/USDT',
  'OP/USDT',
  'INJ/USDT',
  'SUI/USDT',
  'SEI/USDT',
  'TIA/USDT',
  'JUP/USDT',
  'WIF/USDT',
  'BONK/USDT',
  'PYTH/USDT',
  'RAY/USDT',
  'ORCA/USDT',
  'MEME/USDT',
  'PEPE/USDT',
  'SHIB/USDT',
  'FIL/USDT',
  'AAVE/USDT',
  'MKR/USDT',
  'CRV/USDT',
  'SNX/USDT',
  'GRT/USDT',
  'RNDR/USDT',
  'FET/USDT',
  'IMX/USDT',
  'STX/USDT',
]);

const SUPPORTED_PERP_PAIRS = Object.freeze([
  'BTC/USDT-PERP',
  'ETH/USDT-PERP',
  'SOL/USDT-PERP',
  'BNB/USDT-PERP',
  'XRP/USDT-PERP',
  'DOGE/USDT-PERP',
  'AVAX/USDT-PERP',
  'ARB/USDT-PERP',
  'APT/USDT-PERP',
  'SUI/USDT-PERP',
  'OP/USDT-PERP',
  'MATIC/USDT-PERP',
]);

const SUPPORTED_PAIRS = Object.freeze([
  ...SUPPORTED_SPOT_PAIRS,
  ...SUPPORTED_PERP_PAIRS,
]);

const SUPPORTED_PAIR_SET = Object.freeze(
  SUPPORTED_PAIRS.reduce((acc, pair) => {
    acc[pair] = true;
    return acc;
  }, {}),
);

function isSupportedPair(pair) {
  if (!pair) {
    return false;
  }
  const normalized = String(pair).trim().toUpperCase();
  return Boolean(SUPPORTED_PAIR_SET[normalized]);
}

function listSpotPairs() {
  return [...SUPPORTED_SPOT_PAIRS];
}

function listPerpPairs() {
  return [...SUPPORTED_PERP_PAIRS];
}

function listAllPairs() {
  return [...SUPPORTED_PAIRS];
}

module.exports = Object.freeze({
  SUPPORTED_SPOT_PAIRS,
  SUPPORTED_PERP_PAIRS,
  SUPPORTED_PAIRS,
  SUPPORTED_PAIR_SET,
  isSupportedPair,
  listSpotPairs,
  listPerpPairs,
  listAllPairs,
});