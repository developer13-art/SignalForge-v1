'use strict';

const {
  JUPITER_DEFAULT_PRIORITY_FEE_MICRO_LAMPORTS,
  JUPITER_MAX_PRIORITY_FEE_MICRO_LAMPORTS,
  JUPITER_DEFAULT_COMPUTE_UNITS,
  JUPITER_DEFAULT_FEE_ACCOUNT,
} = require('./jupiter.constants');

const { config } = require('../../routers/execution-router.config');

/**
 * SignalForge - Jupiter Fee Service
 *
 * Computes priority fees, platform fees, and compute budgets for
 * Jupiter swaps. The service is a pure calculation layer: the caller
 * is expected to pass the resulting values to the Jupiter client when
 * it builds a swap transaction.
 */

const PRIORITY_LEVELS = Object.freeze({
  low: 1000,
  medium: 10000,
  high: 50000,
  veryHigh: 200000,
});

function clampPriorityFee(microLamports) {
  const numeric = Number(microLamports);
  if (!Number.isFinite(numeric)) {
    return JUPITER_DEFAULT_PRIORITY_FEE_MICRO_LAMPORTS;
  }
  if (numeric < 0) {
    return 0;
  }
  if (numeric > JUPITER_MAX_PRIORITY_FEE_MICRO_LAMPORTS) {
    return JUPITER_MAX_PRIORITY_FEE_MICRO_LAMPORTS;
  }
  return Math.round(numeric);
}

function resolveComputeUnits(userComputeUnits) {
  if (Number.isFinite(userComputeUnits) && userComputeUnits > 0) {
    return Math.min(1400000, Math.max(200000, userComputeUnits));
  }
  return JUPITER_DEFAULT_COMPUTE_UNITS;
}

function resolvePriorityFee({ userMicroLamports, policyMicroLamports, priorityLevel } = {}) {
  const candidates = [];

  if (userMicroLamports !== undefined && userMicroLamports !== null) {
    candidates.push(clampPriorityFee(userMicroLamports));
  }
  if (policyMicroLamports !== undefined && policyMicroLamports !== null) {
    candidates.push(clampPriorityFee(policyMicroLamports));
  }
  if (priorityLevel && PRIORITY_LEVELS[priorityLevel]) {
    candidates.push(clampPriorityFee(PRIORITY_LEVELS[priorityLevel]));
  }
  candidates.push(JUPITER_DEFAULT_PRIORITY_FEE_MICRO_LAMPORTS);

  return clampPriorityFee(Math.max(...candidates));
}

function resolveFeeAccount({ userFeeAccount } = {}) {
  if (userFeeAccount && typeof userFeeAccount === 'string') {
    return userFeeAccount;
  }
  const gatewayConfig = config.gateways.jupiter || {};
  return gatewayConfig.feeAccount || JUPITER_DEFAULT_FEE_ACCOUNT;
}

function estimateLamports({ microLamports, computeUnits }) {
  const micro = clampPriorityFee(microLamports);
  const units = resolveComputeUnits(computeUnits);
  return Math.ceil((micro * units) / 1_000_000);
}

function estimatePlatformFee({ amountUsd, feeBps } = {}) {
  const amount = Number(amountUsd);
  const bps = Number(feeBps);
  if (!Number.isFinite(amount) || !Number.isFinite(bps) || bps <= 0) {
    return { feeUsd: 0, netUsd: amount || 0, feeBps: 0 };
  }
  const feeUsd = (amount * bps) / 10000;
  return {
    feeUsd: Math.round(feeUsd * 100) / 100,
    netUsd: Math.round((amount - feeUsd) * 100) / 100,
    feeBps: bps,
  };
}

function describeFeeEstimate({ userMicroLamports, policyMicroLamports, priorityLevel, computeUnits } = {}) {
  const priorityMicroLamports = resolvePriorityFee({
    userMicroLamports,
    policyMicroLamports,
    priorityLevel,
  });
  const resolvedComputeUnits = resolveComputeUnits(computeUnits);
  const lamports = estimateLamports({
    microLamports: priorityMicroLamports,
    computeUnits: resolvedComputeUnits,
  });

  return {
    priorityMicroLamports,
    computeUnits: resolvedComputeUnits,
    estimatedLamports: lamports,
    estimatedSol: lamports / 1_000_000_000,
  };
}

module.exports = {
  PRIORITY_LEVELS,
  clampPriorityFee,
  resolveComputeUnits,
  resolvePriorityFee,
  resolveFeeAccount,
  estimateLamports,
  estimatePlatformFee,
  describeFeeEstimate,
};