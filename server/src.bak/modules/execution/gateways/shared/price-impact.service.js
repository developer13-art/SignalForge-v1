'use strict';

const {
  SHARED_DEFAULTS,
  SHARED_ERROR_CODES,
} = require('./shared.constants');

/**
 * SignalForge - Shared Price Impact Service
 *
 * Normalizes price impact values across gateways. Different gateways
 * report price impact in different units (fraction vs percent); this
 * service standardizes everything to percent.
 */

class PriceImpactError extends Error {
  constructor(message, code = SHARED_ERROR_CODES.INVALID_REQUEST) {
    super(message);
    this.name = 'PriceImpactError';
    this.code = code;
    this.isSharedDexError = true;
  }
}

function normalizeToPercent(value) {
  if (value === undefined || value === null || value === '') {
    return 0;
  }
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return 0;
  }
  const absolute = Math.abs(numeric);
  return absolute <= 1 ? absolute * 100 : absolute;
}

function classifyImpact(priceImpactPct) {
  const value = Number(priceImpactPct);
  if (!Number.isFinite(value) || value <= 0) {
    return 'none';
  }
  if (value < 0.1) {
    return 'negligible';
  }
  if (value < 0.5) {
    return 'low';
  }
  if (value < 1) {
    return 'moderate';
  }
  if (value < 3) {
    return 'high';
  }
  if (value < 5) {
    return 'very_high';
  }
  return 'critical';
}

function assertWithinLimit({ priceImpactPct, limit }) {
  const effectiveLimit = Number.isFinite(Number(limit))
    ? Number(limit)
    : SHARED_DEFAULTS.PRICE_IMPACT_PCT;
  const value = Number(priceImpactPct);
  if (Number.isFinite(value) && value > effectiveLimit) {
    throw new PriceImpactError(
      `Price impact ${value.toFixed(2)}% exceeds limit ${effectiveLimit}%`,
    );
  }
  return true;
}

function computeImpactFromAmounts({ inAmount, outAmount, referenceOutAmount }) {
  const inNum = Number(inAmount);
  const outNum = Number(outAmount);
  const refNum = Number(referenceOutAmount);

  if (!Number.isFinite(inNum) || !Number.isFinite(outNum) || !Number.isFinite(refNum)) {
    return null;
  }

  if (refNum <= 0) {
    return null;
  }

  const deviation = (refNum - outNum) / refNum;
  const percent = deviation * 100;
  return {
    percent,
    deviation,
    direction: percent > 0 ? 'unfavorable' : percent < 0 ? 'favorable' : 'neutral',
  };
}

function describeImpact({ priceImpactPct }) {
  const percent = normalizeToPercent(priceImpactPct);
  return {
    priceImpactPct: percent,
    classification: classifyImpact(percent),
    warning:
      classifyImpact(percent) === 'critical' || classifyImpact(percent) === 'very_high',
  };
}

function compareImpact({ a, b }) {
  const impactA = normalizeToPercent(a);
  const impactB = normalizeToPercent(b);
  return impactA - impactB;
}

module.exports = {
  PriceImpactError,
  normalizeToPercent,
  classifyImpact,
  assertWithinLimit,
  computeImpactFromAmounts,
  describeImpact,
  compareImpact,
};