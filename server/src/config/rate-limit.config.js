/**
 * Rate Limit Configuration
 *
 * Configures rate limits applied by the platform to protect against
 * abuse and denial of service.
 *
 * @module signalforge/server/config/rate-limit
 */

function toNumber(value, fallback = null) {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toBoolean(value, fallback = false) {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  return ['true', '1', 'yes', 'on', 'enabled'].includes(String(value).toLowerCase());
}

const rateLimitConfig = Object.freeze({
  enabled: toBoolean(process.env.RATE_LIMIT_ENABLED, true),

  global: {
    windowMs: toNumber(process.env.RATE_LIMIT_WINDOW_MS, 60000),
    max: toNumber(process.env.RATE_LIMIT_MAX, 120),
    message: 'Too many requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  },

  perUser: {
    windowMs: toNumber(process.env.RATE_LIMIT_USER_WINDOW_MS, 60000),
    max: toNumber(process.env.RATE_LIMIT_USER_MAX, 300),
  },

  perIp: {
    windowMs: toNumber(process.env.RATE_LIMIT_IP_WINDOW_MS, 60000),
    max: toNumber(process.env.RATE_LIMIT_IP_MAX, 200),
  },

  auth: {
    login: {
      windowMs: toNumber(process.env.RATE_LIMIT_LOGIN_WINDOW_MS, 900000),
      max: toNumber(process.env.RATE_LIMIT_LOGIN_MAX, 10),
      message: 'Too many login attempts, please try again later.',
    },
    register: {
      windowMs: toNumber(process.env.RATE_LIMIT_REGISTER_WINDOW_MS, 3600000),
      max: toNumber(process.env.RATE_LIMIT_REGISTER_MAX, 5),
      message: 'Too many registration attempts, please try again later.',
    },
    passwordReset: {
      windowMs: toNumber(process.env.RATE_LIMIT_PASSWORD_RESET_WINDOW_MS, 3600000),
      max: toNumber(process.env.RATE_LIMIT_PASSWORD_RESET_MAX, 3),
      message: 'Too many password reset requests, please try again later.',
    },
    emailVerification: {
      windowMs: toNumber(process.env.RATE_LIMIT_EMAIL_VERIFY_WINDOW_MS, 3600000),
      max: toNumber(process.env.RATE_LIMIT_EMAIL_VERIFY_MAX, 5),
    },
    twoFactor: {
      windowMs: toNumber(process.env.RATE_LIMIT_2FA_WINDOW_MS, 300000),
      max: toNumber(process.env.RATE_LIMIT_2FA_MAX, 10),
    },
  },

  kyc: {
    submit: {
      windowMs: toNumber(process.env.RATE_LIMIT_KYC_SUBMIT_WINDOW_MS, 3600000),
      max: toNumber(process.env.RATE_LIMIT_KYC_SUBMIT_MAX, 5),
    },
    documentUpload: {
      windowMs: toNumber(process.env.RATE_LIMIT_KYC_UPLOAD_WINDOW_MS, 3600000),
      max: toNumber(process.env.RATE_LIMIT_KYC_UPLOAD_MAX, 20),
    },
  },

  signals: {
    read: {
      windowMs: toNumber(process.env.RATE_LIMIT_SIGNAL_READ_WINDOW_MS, 60000),
      max: toNumber(process.env.RATE_LIMIT_SIGNAL_READ_MAX, 300),
    },
    submit: {
      windowMs: toNumber(process.env.RATE_LIMIT_SIGNAL_SUBMIT_WINDOW_MS, 60000),
      max: toNumber(process.env.RATE_LIMIT_SIGNAL_SUBMIT_MAX, 60),
    },
  },

  trading: {
    execute: {
      windowMs: toNumber(process.env.RATE_LIMIT_TRADE_EXECUTE_WINDOW_MS, 60000),
      max: toNumber(process.env.RATE_LIMIT_TRADE_EXECUTE_MAX, 60),
    },
    manualAction: {
      windowMs: toNumber(process.env.RATE_LIMIT_TRADE_MANUAL_WINDOW_MS, 60000),
      max: toNumber(process.env.RATE_LIMIT_TRADE_MANUAL_MAX, 120),
    },
  },

  webhooks: {
    stripe: {
      windowMs: toNumber(process.env.RATE_LIMIT_WEBHOOK_STRIPE_WINDOW_MS, 60000),
      max: toNumber(process.env.RATE_LIMIT_WEBHOOK_STRIPE_MAX, 1000),
    },
    paystack: {
      windowMs: toNumber(process.env.RATE_LIMIT_WEBHOOK_PAYSTACK_WINDOW_MS, 60000),
      max: toNumber(process.env.RATE_LIMIT_WEBHOOK_PAYSTACK_MAX, 1000),
    },
    tradingview: {
      windowMs: toNumber(process.env.RATE_LIMIT_WEBHOOK_TV_WINDOW_MS, 60000),
      max: toNumber(process.env.RATE_LIMIT_WEBHOOK_TV_MAX, 500),
    },
    kyc: {
      windowMs: toNumber(process.env.RATE_LIMIT_WEBHOOK_KYC_WINDOW_MS, 60000),
      max: toNumber(process.env.RATE_LIMIT_WEBHOOK_KYC_MAX, 300),
    },
    solana: {
      windowMs: toNumber(process.env.RATE_LIMIT_WEBHOOK_SOLANA_WINDOW_MS, 60000),
      max: toNumber(process.env.RATE_LIMIT_WEBHOOK_SOLANA_MAX, 500),
    },
  },

  admin: {
    windowMs: toNumber(process.env.RATE_LIMIT_ADMIN_WINDOW_MS, 60000),
    max: toNumber(process.env.RATE_LIMIT_ADMIN_MAX, 300),
  },

  public: {
    windowMs: toNumber(process.env.RATE_LIMIT_PUBLIC_WINDOW_MS, 60000),
    max: toNumber(process.env.RATE_LIMIT_PUBLIC_MAX, 60),
  },

  store: {
    driver: process.env.RATE_LIMIT_STORE || 'memory',
    tableName: process.env.RATE_LIMIT_TABLE || 'rate_limit_counters',
    prefix: 'rl:',
  },

  skipSuccessfulRequests: toBoolean(process.env.RATE_LIMIT_SKIP_SUCCESSFUL, false),
  skipFailedRequests: toBoolean(process.env.RATE_LIMIT_SKIP_FAILED, false),
});

export default rateLimitConfig;