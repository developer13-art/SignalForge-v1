'use strict';

const { ACTIONS_BASE_PATH } = require('./actions.constants');

/**
 * SignalForge - Solana Actions Configuration
 *
 * Loads and validates configuration for the Solana Actions subsystem.
 * All values are read from the process environment and exposed through
 * a single frozen object. Missing required values cause a hard failure
 * at bootstrap so the platform never runs with incomplete Actions config.
 */

function requireEnv(key) {
  const value = process.env[key];
  if (value === undefined || value === null || String(value).trim() === '') {
    throw new Error(`[solana-actions] Missing required environment variable: ${key}`);
  }
  return String(value).trim();
}

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

function optionalList(key, fallback = []) {
  const value = optionalEnv(key);
  if (value === undefined) {
    return fallback;
  }
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

const config = {
  enabled: optionalBool('SOLANA_ACTIONS_ENABLED', true),

  basePath: optionalEnv('SOLANA_ACTIONS_BASE_PATH', ACTIONS_BASE_PATH),

  publicBaseUrl: optionalEnv('SOLANA_ACTIONS_PUBLIC_BASE_URL', optionalEnv('APP_URL', 'https://signalforge.ai')),

  network: optionalEnv('SOLANA_NETWORK', 'mainnet-beta'),

  commitment: optionalEnv('SOLANA_COMMITMENT', 'confirmed'),

  treasuryWallet: optionalEnv('SOLANA_TREASURY_WALLET'),

  token: {
    defaultSymbol: optionalEnv('SOLANA_ACTIONS_DEFAULT_TOKEN', 'USDC'),
    defaultMint: optionalEnv('SOLANA_ACTIONS_DEFAULT_MINT', ''),
    allowedSymbols: optionalList('SOLANA_ACTIONS_ALLOWED_TOKENS', [
      'USDC',
      'USDT',
      'SOL',
      'JUP',
      'BONK',
      'PYTH',
      'RAY',
      'ORCA',
    ]),
    decimalsOverride: optionalEnv('SOLANA_ACTIONS_DECIMALS_OVERRIDE', ''),
  },

  confirmation: {
    timeoutMs: optionalInt('SOLANA_ACTIONS_CONFIRMATION_TIMEOUT_MS', 90000),
    pollIntervalMs: optionalInt('SOLANA_ACTIONS_CONFIRMATION_POLL_INTERVAL_MS', 3000),
    maxPollAttempts: optionalInt('SOLANA_ACTIONS_CONFIRMATION_MAX_POLL_ATTEMPTS', 30),
    commitment: optionalEnv('SOLANA_ACTIONS_CONFIRMATION_COMMITMENT', 'confirmed'),
  },

  replay: {
    windowSeconds: optionalInt('SOLANA_ACTIONS_REPLAY_WINDOW_SECONDS', 300),
  },

  cors: {
    allowedOrigins: optionalList('SOLANA_ACTIONS_CORS_ORIGINS', []),
    allowedMethods: optionalList('SOLANA_ACTIONS_CORS_METHODS', ['GET', 'POST', 'OPTIONS']),
    allowedHeaders: optionalList('SOLANA_ACTIONS_CORS_HEADERS', [
      'Content-Type',
      'Content-Encoding',
      'Accept-Encoding',
      'Solana-Client',
      'X-Blockchain-Ids',
      'Authorization',
    ]),
    maxAgeSeconds: optionalInt('SOLANA_ACTIONS_CORS_MAX_AGE', 86400),
  },

  analytics: {
    enabled: optionalBool('SOLANA_ACTIONS_ANALYTICS_ENABLED', true),
    sampleRate: optionalInt('SOLANA_ACTIONS_ANALYTICS_SAMPLE_RATE', 100),
  },

  rateLimit: {
    getWindowMs: optionalInt('SOLANA_ACTIONS_GET_RATE_LIMIT_WINDOW_MS', 60000),
    getMax: optionalInt('SOLANA_ACTIONS_GET_RATE_LIMIT_MAX', 240),
    postWindowMs: optionalInt('SOLANA_ACTIONS_POST_RATE_LIMIT_WINDOW_MS', 60000),
    postMax: optionalInt('SOLANA_ACTIONS_POST_RATE_LIMIT_MAX', 120),
  },

  icon: {
    path: optionalEnv('SOLANA_ACTIONS_ICON_PATH', '/assets/logo/signalforge-actions-icon.png'),
    website: optionalEnv('SOLANA_ACTIONS_WEBSITE', 'https://signalforge.ai'),
  },

  featureFlags: {
    enableSubscribeBlinks: optionalBool('SOLANA_ACTIONS_ENABLE_SUBSCRIBE', true),
    enableUpgradeBlinks: optionalBool('SOLANA_ACTIONS_ENABLE_UPGRADE', true),
    enableReferralBlinks: optionalBool('SOLANA_ACTIONS_ENABLE_REFERRAL', true),
    enableTipBlinks: optionalBool('SOLANA_ACTIONS_ENABLE_TIP', true),
    requireIdempotencyKey: optionalBool('SOLANA_ACTIONS_REQUIRE_IDEMPOTENCY', true),
    enableAnalytics: optionalBool('SOLANA_ACTIONS_ANALYTICS', true),
  },

  webhooks: {
    heliusApiKey: optionalEnv('HELIUS_API_KEY', ''),
    heliusWebhookSecret: optionalEnv('HELIUS_WEBHOOK_SECRET', ''),
    quicknodeApiKey: optionalEnv('QUICKNODE_API_KEY', ''),
  },
};

function validateConfig() {
  const errors = [];

  if (config.enabled) {
    if (!config.treasuryWallet) {
      errors.push('SOLANA_TREASURY_WALLET is required when Solana Actions are enabled');
    }
    if (!config.publicBaseUrl) {
      errors.push('SOLANA_ACTIONS_PUBLIC_BASE_URL or APP_URL must be configured');
    }
    if (!Array.isArray(config.token.allowedSymbols) || config.token.allowedSymbols.length === 0) {
      errors.push('At least one allowed token symbol must be configured');
    }
  }

  if (errors.length > 0) {
    const message = `[solana-actions] Configuration validation failed:\n - ${errors.join('\n - ')}`;
    throw new Error(message);
  }

  return true;
}

module.exports = {
  config,
  validateConfig,
};