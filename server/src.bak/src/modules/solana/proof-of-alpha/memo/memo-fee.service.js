'use strict';

const { config } = require('../proof.config');
const memoBuilder = require('./memo-builder.service');

/**
 * SignalForge - Memo Fee Service
 *
 * Estimates and reports the network cost of writing a Proof of Alpha
 * memo. The service queries the current priority fee levels from the
 * RPC provider and returns a recommendation that the submitter uses
 * to set the compute unit price.
 */

const DEFAULT_PRIORITY_LEVELS = Object.freeze({
  min: 1000,
  low: 10000,
  medium: 50000,
  high: 250000,
  veryHigh: 1000000,
});

function microLamportsToLamports(microLamports, computeUnits) {
  const micro = Number(microLamports) || 0;
  const units = Number(computeUnits) || config.priorityFee.computeUnits || 200000;
  return Math.ceil((micro * units) / 1_000_000);
}

function lamportsToSol(lamports) {
  return Number(lamports) / 1_000_000_000;
}

function lamportsToUsd(lamports, solPriceUsd) {
  if (!solPriceUsd) {
    return null;
  }
  return lamportsToSol(lamports) * Number(solPriceUsd);
}

async function fetchRecentPrioritizationFees() {
  const connection = memoBuilder.getConnection();
  try {
    const fees = await connection.getRecentPrioritizationFees();
    if (!Array.isArray(fees)) {
      return [];
    }
    return fees;
  } catch (_error) {
    return [];
  }
}

function summarisePrioritizationFees(fees) {
  if (!Array.isArray(fees) || fees.length === 0) {
    return { ...DEFAULT_PRIORITY_LEVELS, samples: 0 };
  }

  const values = fees
    .map((entry) => Number(entry.prioritizationFee))
    .filter((value) => Number.isFinite(value))
    .sort((a, b) => a - b);

  if (values.length === 0) {
    return { ...DEFAULT_PRIORITY_LEVELS, samples: fees.length };
  }

  const percentile = (p) => {
    const index = Math.min(values.length - 1, Math.max(0, Math.round((values.length - 1) * p)));
    return values[index];
  };

  return {
    min: values[0],
    low: percentile(0.25),
    medium: percentile(0.5),
    high: percentile(0.75),
    veryHigh: percentile(0.95),
    samples: values.length,
  };
}

async function getCurrentFeeSchedule() {
  const fees = await fetchRecentPrioritizationFees();
  const summary = summarisePrioritizationFees(fees);
  const computeUnits = config.priorityFee.computeUnits || 200000;

  const effectiveMicroLamports =
    config.priorityFee.microLamports || summary.medium || DEFAULT_PRIORITY_LEVELS.medium;

  const effectiveLamports = microLamportsToLamports(effectiveMicroLamports, computeUnits);

  return {
    samples: summary.samples,
    levels: {
      min: microLamportsToLamports(summary.min, computeUnits),
      low: microLamportsToLamports(summary.low, computeUnits),
      medium: microLamportsToLamports(summary.medium, computeUnits),
      high: microLamportsToLamports(summary.high, computeUnits),
      veryHigh: microLamportsToLamports(summary.veryHigh, computeUnits),
    },
    effective: {
      microLamports: effectiveMicroLamports,
      lamports: effectiveLamports,
      sol: lamportsToSol(effectiveLamports),
      computeUnits,
    },
  };
}

async function estimateCostPerMemo({ solPriceUsd } = {}) {
  const schedule = await getCurrentFeeSchedule();
  const effectiveLamports = schedule.effective.lamports;

  return {
    lamports: effectiveLamports,
    sol: lamportsToSol(effectiveLamports),
    usd: lamportsToUsd(effectiveLamports, solPriceUsd),
    schedule,
  };
}

async function estimateCostForBatch({ batchSize = 1, solPriceUsd } = {}) {
  const single = await estimateCostPerMemo({ solPriceUsd });
  const size = Math.max(1, Number(batchSize) || 1);

  return {
    batchSize: size,
    perMemo: single,
    total: {
      lamports: single.lamports * size,
      sol: single.sol * size,
      usd: single.usd !== null ? single.usd * size : null,
    },
  };
}

module.exports = {
  DEFAULT_PRIORITY_LEVELS,
  microLamportsToLamports,
  lamportsToSol,
  lamportsToUsd,
  fetchRecentPrioritizationFees,
  summarisePrioritizationFees,
  getCurrentFeeSchedule,
  estimateCostPerMemo,
  estimateCostForBatch,
};