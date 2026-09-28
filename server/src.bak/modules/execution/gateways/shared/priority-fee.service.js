'use strict';

const {
  PRIORITY_FEE_LEVELS,
  SHARED_DEFAULTS,
  SHARED_ERROR_CODES,
} = require('./shared.constants');

/**
 * SignalForge - Shared Priority Fee Service
 *
 * Provides priority fee computation for every gateway. Priority fee
 * affects only Solana-based gateways (Jupiter, Raydium, Orca, Drift);
 * the service is safe to call from Hyperliquid code too since the
 * result is simply ignored.
 */

class PriorityFeeError extends Error {
  constructor(message, code = SHARED_ERROR_CODES.INVALID_REQUEST) {
    super(message);
    this.name = 'PriorityFeeError';
    this.code = code;
    this.isSharedDexError = true;
  }
}

const LEVEL_TO_MICRO_LAMPORTS = Object.freeze({
  [PRIORITY_FEE_LEVELS.NONE]: 0,
  [PRIORITY_FEE_LEVELS.LOW]: 1000,
  [PRIORITY_FEE_LEVELS.MEDIUM]: 10000,
  [PRIORITY_FEE_LEVELS.HIGH]: 50000,
  [PRIORITY_FEE_LEVELS.VERY_HIGH]: 200000,
});

function clampMicroLamports(microLamports) {
  const numeric = Number(microLamports);
  if (!Number.isFinite(numeric)) {
    return SHARED_DEFAULTS.PRIORITY_FEE_MICRO_LAMPORTS;
  }
  if (numeric < 0) {
    return 0;
  }
  if (numeric > SHARED_DEFAULTS.MAX_PRIORITY_FEE_MICRO_LAMPORTS) {
    return SHARED_DEFAULTS.MAX_PRIORITY_FEE_MICRO_LAMPORTS;
  }
  return Math.round(numeric);
}

function resolveLevel(level) {
  if (!level) {
    return PRIORITY_FEE_LEVELS.MEDIUM;
  }
  const normalized = String(level).trim().toLowerCase();
  if (LEVEL_TO_MICRO_LAMPORTS[normalized] !== undefined) {
    return normalized;
  }
  return PRIORITY_FEE_LEVELS.MEDIUM;
}

function resolvePriorityFee({
  level,
  userMicroLamports,
  policyMicroLamports,
  fallbackMicroLamports,
} = {}) {
  const resolvedLevel = resolveLevel(level);
  const candidates = [];

  if (userMicroLamports !== undefined && userMicroLamports !== null) {
    candidates.push(clampMicroLamports(userMicroLamports));
  }
  if (policyMicroLamports !== undefined && policyMicroLamports !== null) {
    candidates.push(clampMicroLamports(policyMicroLamports));
  }
  candidates.push(LEVEL_TO_MICRO_LAMPORTS[resolvedLevel]);
  if (fallbackMicroLamports !== undefined && fallbackMicroLamports !== null) {
    candidates.push(clampMicroLamports(fallbackMicroLamports));
  }
  candidates.push(SHARED_DEFAULTS.PRIORITY_FEE_MICRO_LAMPORTS);

  return clampMicroLamports(Math.max(...candidates));
}

function resolveComputeUnits(computeUnits) {
  const numeric = Number(computeUnits);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return SHARED_DEFAULTS.COMPUTE_UNITS;
  }
  if (numeric < SHARED_DEFAULTS.MIN_COMPUTE_UNITS) {
    return SHARED_DEFAULTS.MIN_COMPUTE_UNITS;
  }
  if (numeric > SHARED_DEFAULTS.MAX_COMPUTE_UNITS) {
    return SHARED_DEFAULTS.MAX_COMPUTE_UNITS;
  }
  return Math.round(numeric);
}

function estimateLamports({ microLamports, computeUnits } = {}) {
  const micro = clampMicroLamports(microLamports);
  const units = resolveComputeUnits(computeUnits);
  return Math.ceil((micro * units) / 1_000_000);
}

function describePriorityFee(options = {}) {
  const microLamports = resolvePriorityFee(options);
  const computeUnits = resolveComputeUnits(options.computeUnits);
  const lamports = estimateLamports({ microLamports, computeUnits });
  return {
    level: resolveLevel(options.level),
    microLamports,
    computeUnits,
    lamports,
    sol: lamports / 1_000_000_000,
  };
}

function boostForUrgency({ baseMicroLamports, urgency } = {}) {
  const base = clampMicroLamports(baseMicroLamports);
  if (urgency === 'high') {
    return clampMicroLamports(base * 2);
  }
  if (urgency === 'critical') {
    return clampMicroLamports(base * 5);
  }
  return base;
}

module.exports = {
  PriorityFeeError,
  LEVEL_TO_MICRO_LAMPORTS,
  clampMicroLamports,
  resolveLevel,
  resolvePriorityFee,
  resolveComputeUnits,
  estimateLamports,
  describePriorityFee,
  boostForUrgency,
};