/**
 * Feature Flags
 *
 * Client-side feature flags. These are intentionally separate from the
 * server's flags because some features are gated purely in the UI.
 * Both layers must agree before a gated feature is exposed.
 *
 * @module client/src/config/feature-flags.config
 */

function toBool(value, fallback = false) {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  return String(value).toLowerCase() === 'true' || value === '1' || value === true;
}

export const featureFlags = Object.freeze({
  solana: toBool(import.meta.env.VITE_FEATURE_SOLANA, true),
  copyTrading: toBool(import.meta.env.VITE_FEATURE_COPY_TRADING, true),
  marketplace: toBool(import.meta.env.VITE_FEATURE_MARKETPLACE, true),
  referrals: toBool(import.meta.env.VITE_FEATURE_REFERRALS, true),
  whiteLabel: toBool(import.meta.env.VITE_FEATURE_WHITE_LABEL, false),
  consensusEngine: true,
  providerCertification: true,
  affiliate: true,
  ib: true,
  support: true,
  replay: true,
  notifications: true,
  twoFactor: true,
  emailVerification: true,
  phoneVerification: true,
});

export function isFeatureEnabled(flagName) {
  return Boolean(featureFlags[flagName]);
}

export default featureFlags;