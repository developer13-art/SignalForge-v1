'use strict';

const {
  JUPITER_MAX_ROUTE_HOPS,
} = require('./jupiter.constants');

/**
 * SignalForge - Jupiter Route Service
 *
 * Interprets the `routePlan` returned by Jupiter and exposes helper
 * methods for display, diagnostics, and risk analysis.
 */

function normalizeHop(hop) {
  if (!hop) {
    return null;
  }

  const swapInfo = hop.swapInfo || {};

  return {
    ammKey: swapInfo.ammKey || null,
    label: swapInfo.label || null,
    inputMint: swapInfo.inputMint || null,
    outputMint: swapInfo.outputMint || null,
    inAmount: swapInfo.inAmount || null,
    outAmount: swapInfo.outAmount || null,
    feeAmount: swapInfo.feeAmount || null,
    feeMint: swapInfo.feeMint || null,
    percent: hop.percent || null,
  };
}

function summarizeRoute(routePlan) {
  if (!Array.isArray(routePlan) || routePlan.length === 0) {
    return {
      hops: [],
      hopCount: 0,
      amms: [],
      ammCount: 0,
      totalPercent: 0,
    };
  }

  const hops = routePlan.map(normalizeHop).filter(Boolean);
  const amms = Array.from(new Set(hops.map((hop) => hop.ammKey).filter(Boolean)));

  const totalPercent = hops.reduce((sum, hop) => {
    const numeric = Number(hop.percent);
    return sum + (Number.isFinite(numeric) ? numeric : 0);
  }, 0);

  return {
    hops,
    hopCount: hops.length,
    amms,
    ammCount: amms.length,
    totalPercent,
  };
}

function validateRouteLength(routePlan) {
  const summary = summarizeRoute(routePlan);
  return {
    valid: summary.hopCount <= JUPITER_MAX_ROUTE_HOPS,
    hopCount: summary.hopCount,
    maxHops: JUPITER_MAX_ROUTE_HOPS,
  };
}

function describeRouteForDisplay(routePlan) {
  const summary = summarizeRoute(routePlan);
  return {
    steps: summary.hops.map((hop, index) => ({
      index: index + 1,
      label: hop.label || hop.ammKey || 'Unknown AMM',
      inputMint: hop.inputMint,
      outputMint: hop.outputMint,
      percent: hop.percent,
    })),
    amms: summary.amms,
    hopCount: summary.hopCount,
  };
}

function computeEffectivePrice({ inAmount, outAmount, inputDecimals, outputDecimals }) {
  const inNum = Number(inAmount);
  const outNum = Number(outAmount);

  if (!Number.isFinite(inNum) || !Number.isFinite(outNum) || inNum === 0) {
    return null;
  }

  const adjustedIn = inNum / Math.pow(10, inputDecimals || 0);
  const adjustedOut = outNum / Math.pow(10, outputDecimals || 0);

  return {
    inUnits: adjustedIn,
    outUnits: adjustedOut,
    price: adjustedOut / adjustedIn,
  };
}

function extractFeeAmount(routePlan) {
  const summary = summarizeRoute(routePlan);
  return summary.hops.reduce((acc, hop) => {
    if (!hop.feeAmount || !hop.feeMint) {
      return acc;
    }
    acc[hop.feeMint] = (acc[hop.feeMint] || 0) + Number(hop.feeAmount || 0);
    return acc;
  }, {});
}

module.exports = {
  normalizeHop,
  summarizeRoute,
  validateRouteLength,
  describeRouteForDisplay,
  computeEffectivePrice,
  extractFeeAmount,
};