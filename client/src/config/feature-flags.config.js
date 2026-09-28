'use strict';

/**
 * SignalForge - Frontend Feature Flags
 *
 * Feature flags are read from environment variables at build time so
 * that the frontend can hide or show entire sections without a
 * separate deployment. Every new feature added to the platform must
 * register its flag here.
 */

function resolveFlag(name, fallback = false) {
  if (typeof import.meta === 'undefined' || !import.meta.env) {
    return fallback;
  }
  const value = import.meta.env[name];
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  const normalized = String(value).toLowerCase();
  if (['true', '1', 'yes', 'on'].includes(normalized)) {
    return true;
  }
  if (['false', '0', 'no', 'off'].includes(normalized)) {
    return false;
  }
  return fallback;
}

const FEATURE_FLAGS = Object.freeze({
  // Core platform
  solana: resolveFlag('VITE_FEATURE_SOLANA', true),
  solanaActions: resolveFlag('VITE_FEATURE_SOLANA_ACTIONS', true),
  copyTrading: resolveFlag('VITE_FEATURE_COPY_TRADING', true),
  consensus: resolveFlag('VITE_FEATURE_CONSENSUS', true),
  providerCertification: resolveFlag('VITE_FEATURE_PROVIDER_CERTIFICATION', true),
  marketplace: resolveFlag('VITE_FEATURE_MARKETPLACE', true),
  referrals: resolveFlag('VITE_FEATURE_REFERRALS', true),
  whiteLabel: resolveFlag('VITE_FEATURE_WHITE_LABEL', false),

  // Feature B
  proofOfAlpha: resolveFlag('VITE_FEATURE_PROOF_OF_ALPHA', true),

  // Feature C
  cryptoTrading: resolveFlag('VITE_FEATURE_CRYPTO_TRADING', true),
  hybridExecution: resolveFlag('VITE_FEATURE_HYBRID_EXECUTION', true),
});

function isEnabled(flagName) {
  if (!flagName) {
    return false;
  }
  return FEATURE_FLAGS[flagName] === true;
}

function getAllFlags() {
  return { ...FEATURE_FLAGS };
}

function listEnabledFlags() {
  return Object.entries(FEATURE_FLAGS)
    .filter(([, enabled]) => enabled === true)
    .map(([name]) => name);
}

export default FEATURE_FLAGS;
export { FEATURE_FLAGS, isEnabled, getAllFlags, listEnabledFlags };