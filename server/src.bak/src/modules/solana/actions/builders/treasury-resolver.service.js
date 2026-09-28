'use strict';

const { PublicKey } = require('@solana/web3.js');

const { config } = require('../actions.config');
const { ServiceUnavailableError, InvalidParameterError } = require('../actions.errors');

/**
 * SignalForge - Treasury Resolver Service
 *
 * Resolves the treasury wallet that receives Blink payments. The
 * treasury can be a global wallet configured by environment variable,
 * or a per-tenant wallet resolved from a white-label configuration.
 * Per-tenant resolution is intentionally not implemented here so the
 * service remains self-contained; a decorator can be added when white
 * label treasury routing is enabled.
 */

let cachedTreasury = null;

function parsePublicKey(address, label) {
  try {
    return new PublicKey(address);
  } catch (error) {
    throw new InvalidParameterError(`${label} is not a valid Solana address`, {
      address,
      reason: error.message,
    });
  }
}

function resolveGlobalTreasury() {
  if (cachedTreasury) {
    return cachedTreasury;
  }

  const address = config.treasuryWallet;
  if (!address) {
    throw new ServiceUnavailableError('Treasury wallet is not configured');
  }

  cachedTreasury = parsePublicKey(address, 'Treasury wallet');
  return cachedTreasury;
}

function resolveTreasury({ tenantId, providerId } = {}) {
  void tenantId;
  void providerId;
  return resolveGlobalTreasury();
}

function isValidTreasuryAddress(address) {
  if (!address) {
    return false;
  }
  try {
    // eslint-disable-next-line no-new
    new PublicKey(address);
    return true;
  } catch (_error) {
    return false;
  }
}

function clearCache() {
  cachedTreasury = null;
}

module.exports = {
  resolveTreasury,
  resolveGlobalTreasury,
  isValidTreasuryAddress,
  clearCache,
};