'use strict';

/**
 * SignalForge - Priority Fee Presets
 *
 * Presets for Solana priority fees used across DEX gateways. Kept in
 * the shared package so the frontend can render the same options
 * that the backend will honor.
 */

const PRIORITY_FEE_PRESETS = Object.freeze({
  none: {
    key: 'none',
    label: 'No priority fee',
    microLamports: 0,
    description: 'Slowest but cheapest. Suitable for non-urgent swaps.',
  },
  low: {
    key: 'low',
    label: 'Low',
    microLamports: 1000,
    description: 'Below-market fee. Best for small swaps with flexible timing.',
  },
  medium: {
    key: 'medium',
    label: 'Medium',
    microLamports: 10000,
    description: 'Moderate fee. Default for most swaps and works reliably.',
  },
  high: {
    key: 'high',
    label: 'High',
    microLamports: 50000,
    description: 'Prioritized inclusion. Recommended for volatile market conditions.',
  },
  veryHigh: {
    key: 'veryHigh',
    label: 'Very High',
    microLamports: 200000,
    description: 'Aggressive priority. Use during congestion or for time-sensitive trades.',
  },
});

const PRIORITY_FEE_COMPUTE_UNITS = Object.freeze({
  minimal: 200000,
  standard: 400000,
  high: 800000,
  maximum: 1400000,
});

const PRIORITY_FEE_DEFAULT_LEVEL = 'medium';
const PRIORITY_FEE_DEFAULT_MICRO_LAMPORTS = 10000;
const PRIORITY_FEE_MAX_MICRO_LAMPORTS = 10000000;

function listPresets() {
  return Object.values(PRIORITY_FEE_PRESETS);
}

function findPreset(key) {
  if (!key) {
    return null;
  }
  const normalized = String(key).trim().toLowerCase();
  return PRIORITY_FEE_PRESETS[normalized] || null;
}

function clampMicroLamports(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return PRIORITY_FEE_DEFAULT_MICRO_LAMPORTS;
  }
  if (numeric < 0) {
    return 0;
  }
  if (numeric > PRIORITY_FEE_MAX_MICRO_LAMPORTS) {
    return PRIORITY_FEE_MAX_MICRO_LAMPORTS;
  }
  return Math.round(numeric);
}

function resolveComputeUnits(level) {
  if (level === 'veryHigh') {
    return PRIORITY_FEE_COMPUTE_UNITS.maximum;
  }
  if (level === 'high') {
    return PRIORITY_FEE_COMPUTE_UNITS.high;
  }
  if (level === 'medium') {
    return PRIORITY_FEE_COMPUTE_UNITS.standard;
  }
  return PRIORITY_FEE_COMPUTE_UNITS.minimal;
}

function describePreset(key) {
  const preset = findPreset(key);
  if (!preset) {
    return null;
  }
  return {
    ...preset,
    computeUnits: resolveComputeUnits(preset.key),
  };
}

module.exports = Object.freeze({
  PRIORITY_FEE_PRESETS,
  PRIORITY_FEE_COMPUTE_UNITS,
  PRIORITY_FEE_DEFAULT_LEVEL,
  PRIORITY_FEE_DEFAULT_MICRO_LAMPORTS,
  PRIORITY_FEE_MAX_MICRO_LAMPORTS,
  listPresets,
  findPreset,
  clampMicroLamports,
  resolveComputeUnits,
  describePreset,
});