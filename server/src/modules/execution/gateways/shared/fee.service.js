'use strict';

const {
  FEE_MODES,
  SHARED_DEFAULTS,
  SHARED_ERROR_CODES,
} = require('./shared.constants');

/**
 * SignalForge - Shared Fee Service
 *
 * Computes platform fees, network fees, and per-gateway fee rates in a
 * uniform way. Gateways that charge a platform fee consult this
 * service so that the calculation is consistent across the platform.
 */

class FeeError extends Error {
  constructor(message, code = SHARED_ERROR_CODES.INVALID_REQUEST) {
    super(message);
    this.name = 'FeeError';
    this.code = code;
    this.isSharedDexError = true;
  }
}

const DEFAULT_FEE_BPS = Object.freeze({
  jupiter: 0,
  raydium: 25,
  orca: 30,
  hyperliquid: 2,
  drift: 10,
});

function resolvePlatformFeeBps({ gateway, overrideBps } = {}) {
  if (overrideBps !== undefined && overrideBps !== null) {
    const numeric = Number(overrideBps);
    if (!Number.isFinite(numeric) || numeric < 0 || numeric > 1000) {
      throw new FeeError('overrideBps must be between 0 and 1000');
    }
    return numeric;
  }
  return DEFAULT_FEE_BPS[gateway] ?? 0;
}

function computePlatformFee({ amountUsd, gateway, overrideBps } = {}) {
  const amount = Number(amountUsd);
  if (!Number.isFinite(amount) || amount <= 0) {
    return {
      feeUsd: 0,
      netUsd: 0,
      feeBps: 0,
    };
  }

  const bps = resolvePlatformFeeBps({ gateway, overrideBps });
  const feeUsd = (amount * bps) / 10000;

  return {
    feeUsd: Math.round(feeUsd * 100) / 100,
    netUsd: Math.round((amount - feeUsd) * 100) / 100,
    feeBps: bps,
  };
}

function computeNetworkFee({ microLamports, computeUnits } = {}) {
  const micro = Number(microLamports) || SHARED_DEFAULTS.PRIORITY_FEE_MICRO_LAMPORTS;
  const units = Number(computeUnits) || SHARED_DEFAULTS.COMPUTE_UNITS;
  const lamports = Math.ceil((micro * units) / 1_000_000);

  return {
    lamports,
    sol: lamports / 1_000_000_000,
    microLamports: micro,
    computeUnits: units,
  };
}

function computeTotalFee({ platformFeeUsd, networkFeeLamports, solPriceUsd } = {}) {
  const platform = Number(platformFeeUsd) || 0;
  const lamports = Number(networkFeeLamports) || 0;
  const solPrice = Number(solPriceUsd) || 0;

  const networkUsd = solPrice > 0 ? (lamports / 1_000_000_000) * solPrice : 0;

  return {
    platformFeeUsd: platform,
    networkFeeLamports: lamports,
    networkFeeUsd: Math.round(networkUsd * 100) / 100,
    totalUsd: Math.round((platform + networkUsd) * 100) / 100,
  };
}

function resolveFeeMode({ mode, userPreference, gatewayDefault } = {}) {
  if (Object.values(FEE_MODES).includes(mode)) {
    return mode;
  }
  if (Object.values(FEE_MODES).includes(userPreference)) {
    return userPreference;
  }
  return gatewayDefault || FEE_MODES.AUTO;
}

function describeFeeSummary({
  amountUsd,
  gateway,
  overrideBps,
  microLamports,
  computeUnits,
  solPriceUsd,
} = {}) {
  const platform = computePlatformFee({ amountUsd, gateway, overrideBps });
  const network = computeNetworkFee({ microLamports, computeUnits });
  const total = computeTotalFee({
    platformFeeUsd: platform.feeUsd,
    networkFeeLamports: network.lamports,
    solPriceUsd,
  });

  return {
    gateway,
    platform,
    network,
    total,
  };
}

module.exports = {
  FeeError,
  DEFAULT_FEE_BPS,
  resolvePlatformFeeBps,
  computePlatformFee,
  computeNetworkFee,
  computeTotalFee,
  resolveFeeMode,
  describeFeeSummary,
};