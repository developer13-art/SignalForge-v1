'use strict';

/**
 * SignalForge - Proof of Alpha Configuration
 *
 * Loads and validates configuration for the Proof of Alpha subsystem.
 * Every value is read from the process environment so operators can
 * tune the system without a code change.
 */

function optionalEnv(key, fallback = undefined) {
  const value = process.env[key];
  if (value === undefined || value === null || String(value).trim() === '') {
    return fallback;
  }
  return String(value).trim();
}

function optionalBool(key, fallback = false) {
  const value = optionalEnv(key);
  if (value === undefined) {
    return fallback;
  }
  const normalized = value.toLowerCase();
  if (['true', '1', 'yes', 'on'].includes(normalized)) {
    return true;
  }
  if (['false', '0', 'no', 'off'].includes(normalized)) {
    return false;
  }
  return fallback;
}

function optionalInt(key, fallback) {
  const value = optionalEnv(key);
  if (value === undefined) {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    return fallback;
  }
  return parsed;
}

function optionalFloat(key, fallback) {
  const value = optionalEnv(key);
  if (value === undefined) {
    return fallback;
  }
  const parsed = Number.parseFloat(value);
  if (Number.isNaN(parsed)) {
    return fallback;
  }
  return parsed;
}

const config = {
  enabled: optionalBool('PROOF_OF_ALPHA_ENABLED', true),

  authority: {
    keypairPath: optionalEnv('PROOF_OF_ALPHA_KEYPAIR_PATH', ''),
    keypairJson: optionalEnv('PROOF_OF_ALPHA_KEYPAIR_JSON', ''),
    publicKey: optionalEnv('PROOF_OF_ALPHA_AUTHORITY_PUBLIC_KEY', ''),
  },

  network: optionalEnv('SOLANA_NETWORK', 'mainnet-beta'),
  commitment: optionalEnv('PROOF_OF_ALPHA_COMMITMENT', 'confirmed'),

  memo: {
    programId: optionalEnv(
      'PROOF_OF_ALPHA_MEMO_PROGRAM_ID',
      'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr',
    ),
    version: optionalInt('PROOF_OF_ALPHA_MEMO_VERSION', 1),
    prefix: optionalEnv('PROOF_OF_ALPHA_MEMO_PREFIX', 'SFA-PROOF'),
    maxBytes: optionalInt('PROOF_OF_ALPHA_MAX_MEMO_BYTES', 566),
  },

  confirmation: {
    timeoutMs: optionalInt('PROOF_OF_ALPHA_CONFIRMATION_TIMEOUT_MS', 90000),
    pollIntervalMs: optionalInt('PROOF_OF_ALPHA_CONFIRMATION_POLL_INTERVAL_MS', 3000),
    maxPollAttempts: optionalInt('PROOF_OF_ALPHA_CONFIRMATION_MAX_ATTEMPTS', 30),
  },

  retry: {
    maxAttempts: optionalInt('PROOF_OF_ALPHA_MAX_RETRY_ATTEMPTS', 5),
    backoffMs: optionalEnv('PROOF_OF_ALPHA_RETRY_BACKOFF_MS', '2000,5000,15000,30000,60000')
      .split(',')
      .map((value) => Number.parseInt(value.trim(), 10))
      .filter((value) => !Number.isNaN(value)),
  },

  significance: {
    minPnlAbsolute: optionalFloat('PROOF_OF_ALPHA_MIN_PNL_ABSOLUTE', 0),
    minPnlPercent: optionalFloat('PROOF_OF_ALPHA_MIN_PNL_PERCENT', 0),
    includeLosingTrades: optionalBool('PROOF_OF_ALPHA_INCLUDE_LOSING_TRADES', true),
    minProviderTradesForCertification: optionalInt(
      'PROOF_OF_ALPHA_MIN_TRADES_FOR_CERTIFICATION',
      100,
    ),
  },

  priorityFee: {
    microLamports: optionalInt('PROOF_OF_ALPHA_PRIORITY_FEE_MICRO_LAMPORTS', 50000),
    computeUnits: optionalInt('PROOF_OF_ALPHA_COMPUTE_UNITS', 200000),
  },

  rateLimit: {
    submissionsPerProviderPerDay: optionalInt(
      'PROOF_OF_ALPHA_MAX_SUBMISSIONS_PER_PROVIDER_PER_DAY',
      5000,
    ),
    verificationsPerMinute: optionalInt('PROOF_OF_ALPHA_MAX_VERIFICATIONS_PER_MINUTE', 240),
  },

  leaderboard: {
    defaultLimit: optionalInt('PROOF_OF_ALPHA_LEADERBOARD_DEFAULT_LIMIT', 50),
    maxLimit: optionalInt('PROOF_OF_ALPHA_LEADERBOARD_MAX_LIMIT', 200),
    cacheTtlSeconds: optionalInt('PROOF_OF_ALPHA_LEADERBOARD_CACHE_TTL_SECONDS', 300),
  },

  verification: {
    allowPublicLookup: optionalBool('PROOF_OF_ALPHA_ALLOW_PUBLIC_LOOKUP', true),
    requireOnChainMatch: optionalBool('PROOF_OF_ALPHA_REQUIRE_ON_CHAIN_MATCH', true),
  },

  featureFlags: {
    writeTrades: optionalBool('PROOF_OF_ALPHA_WRITE_TRADES', true),
    writeCertifications: optionalBool('PROOF_OF_ALPHA_WRITE_CERTIFICATIONS', true),
    writeMilestones: optionalBool('PROOF_OF_ALPHA_WRITE_MILESTONES', true),
    leaderboardEnabled: optionalBool('PROOF_OF_ALPHA_LEADERBOARD_ENABLED', true),
    publicVerificationEnabled: optionalBool('PROOF_OF_ALPHA_PUBLIC_VERIFICATION_ENABLED', true),
  },
};

function validateConfig() {
  const errors = [];

  if (config.enabled) {
    if (!config.authority.keypairPath && !config.authority.keypairJson) {
      errors.push(
        'PROOF_OF_ALPHA_KEYPAIR_PATH or PROOF_OF_ALPHA_KEYPAIR_JSON must be configured when Proof of Alpha is enabled',
      );
    }
    if (!config.memo.programId) {
      errors.push('PROOF_OF_ALPHA_MEMO_PROGRAM_ID must be configured');
    }
  }

  if (config.retry.backoffMs.length === 0) {
    errors.push('PROOF_OF_ALPHA_RETRY_BACKOFF_MS must contain at least one value');
  }

  if (errors.length > 0) {
    throw new Error(`[proof-of-alpha] Configuration validation failed:\n - ${errors.join('\n - ')}`);
  }

  return true;
}

module.exports = {
  config,
  validateConfig,
};