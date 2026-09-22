/**
 * VerifyMe Configuration
 *
 * Configures the VerifyMe KYC provider for identity verification in
 * Nigeria and other supported African countries.
 *
 * @module signalforge/server/config/verifyme
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

const verifyMeConfig = Object.freeze({
  enabled: toBoolean(process.env.VERIFYME_ENABLED, false),
  clientId: process.env.VERIFYME_CLIENT_ID || null,
  clientSecret: process.env.VERIFYME_CLIENT_SECRET || null,
  baseUrl: process.env.VERIFYME_BASE_URL || 'https://vapi.verifyme.ng/v1',
  callbackUrl:
    process.env.VERIFYME_CALLBACK_URL ||
    'http://localhost:4000/api/webhooks/kyc/verifyme',

  environment: process.env.VERIFYME_ENVIRONMENT || 'sandbox',

  defaultCountry: process.env.VERIFYME_DEFAULT_COUNTRY || 'NG',

  endpoints: {
    token: '/auth/token',
    ninVerification: '/nin',
    bvnVerification: '/bvn',
    passportVerification: '/passport',
    driversLicenseVerification: '/drivers-license',
    votersCardVerification: '/voters-card',
    cacVerification: '/cac',
    selfieVerification: '/face/verify',
  },

  products: {
    nin: true,
    bvn: true,
    passport: true,
    driversLicense: true,
    votersCard: true,
    selfie: true,
    cac: false,
  },

  tokenCache: {
    enabled: true,
    ttlSeconds: toNumber(process.env.VERIFYME_TOKEN_CACHE_TTL, 3000),
  },

  retry: {
    maxAttempts: toNumber(process.env.VERIFYME_RETRY_MAX_ATTEMPTS, 3),
    baseDelayMs: toNumber(process.env.VERIFYME_RETRY_BASE_DELAY_MS, 2000),
  },

  timeoutMs: toNumber(process.env.VERIFYME_TIMEOUT_MS, 45000),

  webhook: {
    signatureHeader: 'x-verifyme-signature',
    verifySignature: toBoolean(process.env.VERIFYME_VERIFY_SIGNATURE, true),
  },
});

export default verifyMeConfig;