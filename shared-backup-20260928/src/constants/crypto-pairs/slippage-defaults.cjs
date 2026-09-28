'use strict';

/**
 * SignalForge - Slippage Defaults
 *
 * Slippage tiers per pair class and per user policy. Kept in the
 * shared package so that the frontend can render the same presets
 * that the backend uses to resolve effective slippage.
 */

const SLIPPAGE_PRESETS = Object.freeze({
  tight: 10,
  normal: 50,
  relaxed: 100,
  aggressive: 300,
  veryAggressive: 1000,
});

const SLIPPAGE_BY_PAIR_CLASS = Object.freeze({
  stable_stable: 5,
  major_major: 10,
  major_alt: 25,
  alt_alt: 50,
  meme_alt: 100,
  low_liquidity: 300,
});

const SLIPPAGE_BY_NOTIONAL_USD = Object.freeze({
  below_100: 10,
  below_1000: 25,
  below_10000: 50,
  below_100000: 100,
  above_100000: 200,
});

const SLIPPAGE_MIN_BPS = 1;

const SLIPPAGE_MAX_BPS = 5000;

const SLIPPAGE_DEFAULT_BPS = 50;

function clampSlippageBps(bps) {
  const numeric = Number(bps);
  if (!Number.isFinite(numeric)) {
    return SLIPPAGE_DEFAULT_BPS;
  }
  if (numeric < SLIPPAGE_MIN_BPS) {
    return SLIPPAGE_MIN_BPS;
  }
  if (numeric > SLIPPAGE_MAX_BPS) {
    return SLIPPAGE_MAX_BPS;
  }
  return Math.round(numeric);
}

function resolveNotionalTier(amountUsd) {
  const amount = Number(amountUsd) || 0;
  if (amount < 100) {
    return SLIPPAGE_BY_NOTIONAL_USD.below_100;
  }
  if (amount < 1000) {
    return SLIPPAGE_BY_NOTIONAL_USD.below_1000;
  }
  if (amount < 10000) {
    return SLIPPAGE_BY_NOTIONAL_USD.below_10000;
  }
  if (amount < 100000) {
    return SLIPPAGE_BY_NOTIONAL_USD.below_100000;
  }
  return SLIPPAGE_BY_NOTIONAL_USD.above_100000;
}

function describePreset(name) {
  const bps = SLIPPAGE_PRESETS[name];
  if (bps === undefined) {
    return null;
  }
  return {
    name,
    bps,
    percent: bps / 100,
  };
}

function listPresets() {
  return Object.entries(SLIPPAGE_PRESETS).map(([name, bps]) => ({
    name,
    bps,
    percent: bps / 100,
  }));
}

function describeSlippage(bps) {
  const numeric = clampSlippageBps(bps);
  return {
    bps: numeric,
    percent: numeric / 100,
    label: `${(numeric / 100).toFixed(2)}%`,
  };
}

module.exports = Object.freeze({
  SLIPPAGE_PRESETS,
  SLIPPAGE_BY_PAIR_CLASS,
  SLIPPAGE_BY_NOTIONAL_USD,
  SLIPPAGE_MIN_BPS,
  SLIPPAGE_MAX_BPS,
  SLIPPAGE_DEFAULT_BPS,
  clampSlippageBps,
  resolveNotionalTier,
  describePreset,
  listPresets,
  describeSlippage,
});