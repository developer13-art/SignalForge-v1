/**
 * Environment Validator
 *
 * Validates the presence and shape of environment variables that
 * SignalForge requires to run. Fails fast if critical variables are
 * missing or malformed.
 *
 * @module signalforge/server/bootstrap/validateEnv
 */

const REQUIRED_ALWAYS = [
  'NODE_ENV',
  'APP_PORT',
  'APP_URL',
  'API_URL',
  'DB_HOST',
  'DB_PORT',
  'DB_NAME',
  'DB_USER',
  'JWT_SECRET',
  'SESSION_SECRET',
  'COOKIE_SECRET',
  'ENCRYPTION_KEY',
];

const REQUIRED_IN_PRODUCTION = [
  'MAIL_HOST',
  'MAIL_FROM_ADDRESS',
  'STORAGE_BUCKET',
  'STORAGE_REGION',
];

const REQUIRED_WHEN_FEATURE_ENABLED = {
  METAAPI_TOKEN: 'METAAPI_ENABLED',
  TELEGRAM_API_ID: 'TELEGRAM_ENABLED',
  TELEGRAM_API_HASH: 'TELEGRAM_ENABLED',
  TELEGRAM_SESSION_ENCRYPTION_KEY: 'TELEGRAM_ENABLED',
  DISCORD_CLIENT_ID: 'DISCORD_ENABLED',
  DISCORD_CLIENT_SECRET: 'DISCORD_ENABLED',
  WHATSAPP_ACCESS_TOKEN: 'WHATSAPP_ENABLED',
  TRADINGVIEW_WEBHOOK_SECRET: 'TRADINGVIEW_ENABLED',
  OPENAI_API_KEY: 'LLM_PROVIDER',
  STRIPE_SECRET_KEY: 'STRIPE_ENABLED',
  PAYSTACK_SECRET_KEY: 'PAYSTACK_ENABLED',
  SMILEID_PARTNER_ID: 'SMILEID_ENABLED',
  SMILEID_API_KEY: 'SMILEID_ENABLED',
  SOLANA_RPC_URL: 'FEATURE_SOLANA',
};

const SECRET_MIN_LENGTH = 32;

const NUMERIC_VARS = [
  'APP_PORT',
  'DB_PORT',
  'DB_POOL_MIN',
  'DB_POOL_MAX',
  'RATE_LIMIT_MAX',
  'JWT_REFRESH_MAX_AGE_MS',
  'SESSION_MAX_AGE_MS',
];

function isTruthy(value) {
  if (value === undefined || value === null || value === '') {
    return false;
  }
  return ['true', '1', 'yes', 'on', 'enabled'].includes(String(value).toLowerCase());
}

export function validateEnv(options = {}) {
  const errors = [];
  const warnings = [];
  const env = process.env.NODE_ENV || 'development';
  const isProd = env === 'production';

  for (const variable of REQUIRED_ALWAYS) {
    if (!process.env[variable] || process.env[variable] === '') {
      errors.push(`Missing required environment variable: ${variable}`);
    }
  }

  if (isProd) {
    for (const variable of REQUIRED_IN_PRODUCTION) {
      if (!process.env[variable] || process.env[variable] === '') {
        errors.push(`Missing production environment variable: ${variable}`);
      }
    }
  }

  for (const [variable, featureFlag] of Object.entries(
    REQUIRED_WHEN_FEATURE_ENABLED,
  )) {
    const enabled = isTruthy(process.env[featureFlag]);
    if (enabled && (!process.env[variable] || process.env[variable] === '')) {
      if (featureFlag === 'LLM_PROVIDER') {
        const provider = process.env.LLM_PROVIDER;
        const providerKey = {
          openai: 'OPENAI_API_KEY',
          anthropic: 'ANTHROPIC_API_KEY',
          google: 'GOOGLE_AI_API_KEY',
        }[provider];
        if (providerKey && !process.env[providerKey]) {
          errors.push(
            `Missing ${providerKey} required for LLM_PROVIDER=${provider}`,
          );
        }
      } else {
        errors.push(
          `Missing ${variable} required when ${featureFlag} is enabled`,
        );
      }
    }
  }

  for (const variable of NUMERIC_VARS) {
    const value = process.env[variable];
    if (value !== undefined && value !== '') {
      const parsed = Number(value);
      if (!Number.isFinite(parsed)) {
        errors.push(`Environment variable ${variable} must be numeric`);
      }
    }
  }

  for (const secretVar of ['JWT_SECRET', 'SESSION_SECRET', 'ENCRYPTION_KEY']) {
    const value = process.env[secretVar];
    if (!value) {
      continue;
    }
    if (isProd && value.length < SECRET_MIN_LENGTH) {
      errors.push(
        `${secretVar} must be at least ${SECRET_MIN_LENGTH} characters in production`,
      );
    }
    if (value.includes('changeme') || value.includes('default')) {
      warnings.push(
        `${secretVar} appears to use a placeholder value. Replace before production.`,
      );
    }
  }

  const encKey = process.env.ENCRYPTION_KEY;
  if (encKey) {
    let decodedLength = 0;
    try {
      if (/^[a-f0-9]{64}$/i.test(encKey)) {
        decodedLength = Buffer.from(encKey, 'hex').length;
      } else {
        decodedLength = Buffer.from(encKey, 'base64').length;
      }
    } catch {
      errors.push('ENCRYPTION_KEY must be valid hex or base64');
    }
    if (decodedLength !== 0 && decodedLength !== 32) {
      errors.push('ENCRYPTION_KEY must decode to exactly 32 bytes');
    }
  }

  const apiUrl = process.env.API_URL;
  if (apiUrl && !/^https?:\/\//.test(apiUrl)) {
    errors.push('API_URL must start with http:// or https://');
  }

  const appUrl = process.env.APP_URL;
  if (appUrl && !/^https?:\/\//.test(appUrl)) {
    errors.push('APP_URL must start with http:// or https://');
  }

  if (isProd) {
    if (process.env.SESSION_COOKIE_SECURE !== 'true' && !options.allowInsecureCookies) {
      warnings.push(
        'SESSION_COOKIE_SECURE should be true in production. Cookies will be sent over HTTP.',
      );
    }
    if (process.env.DB_SSL !== 'true') {
      warnings.push(
        'DB_SSL should be true in production to encrypt database connections.',
      );
    }
  }

  if (errors.length > 0) {
    const message = [
      'Environment validation failed:',
      ...errors.map((e) => `  - ${e}`),
    ].join('\n');
    const error = new Error(message);
    error.code = 'ENV_VALIDATION_FAILED';
    error.details = { errors, warnings };
    throw error;
  }

  return {
    valid: true,
    env,
    warnings,
  };
}

export const VALIDATION_RULES = Object.freeze({
  requiredAlways: REQUIRED_ALWAYS,
  requiredInProduction: REQUIRED_IN_PRODUCTION,
  requiredWhenFeatureEnabled: REQUIRED_WHEN_FEATURE_ENABLED,
  numericVars: NUMERIC_VARS,
  secretMinLength: SECRET_MIN_LENGTH,
});

export default validateEnv;