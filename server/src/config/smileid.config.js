/**
 * Smile ID Configuration
 *
 * Configures the Smile ID KYC provider for identity verification.
 *
 * @module signalforge/server/config/smileid
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

const smileIdConfig = Object.freeze({
  enabled: toBoolean(process.env.SMILEID_ENABLED, true),
  partnerId: process.env.SMILEID_PARTNER_ID || null,
  apiKey: process.env.SMILEID_API_KEY || null,
  baseUrl: process.env.SMILEID_BASE_URL || 'https://api.smileidentity.com/v1',
  callbackUrl:
    process.env.SMILEID_CALLBACK_URL ||
    'http://localhost:4000/api/webhooks/kyc/smileid',

  environment: process.env.SMILEID_ENVIRONMENT || 'sandbox',

  products: {
    documentVerification: true,
    smartSelfieAuthentication: true,
    biometricKyc: true,
    enhancedKyc: true,
    documentVerificationWithSelfie: true,
  },

  defaultCountry: process.env.SMILEID_DEFAULT_COUNTRY || 'NG',

  jobTypes: {
    documentVerification: '6',
    smartSelfieAuthentication: '2',
    biometricKyc: '1',
  },

  options: {
    returnJobStatus: true,
    returnHistory: false,
    returnImageLinks: true,
    returnPersonalInfo: true,
    useEnrolledImage: false,
  },

  retry: {
    maxAttempts: toNumber(process.env.SMILEID_RETRY_MAX_ATTEMPTS, 3),
    baseDelayMs: toNumber(process.env.SMILEID_RETRY_BASE_DELAY_MS, 2000),
  },

  timeoutMs: toNumber(process.env.SMILEID_TIMEOUT_MS, 45000),

  webhook: {
    signatureHeader: 'x-smile-signature',
    verifySignature: toBoolean(process.env.SMILEID_VERIFY_SIGNATURE, true),
  },

  acceptedDocTypes: {
    NG: ['NATIONAL_ID', 'VOTERS_CARD', 'DRIVERS_LICENSE', 'INTERNATIONAL_PASSPORT'],
    GH: ['NATIONAL_ID', 'DRIVERS_LICENSE', 'INTERNATIONAL_PASSPORT', 'VOTERS_CARD'],
    KE: ['NATIONAL_ID', 'DRIVERS_LICENSE', 'INTERNATIONAL_PASSPORT'],
    ZA: ['NATIONAL_ID', 'DRIVERS_LICENSE', 'INTERNATIONAL_PASSPORT'],
    US: ['DRIVERS_LICENSE', 'INTERNATIONAL_PASSPORT'],
    GB: ['DRIVERS_LICENSE', 'INTERNATIONAL_PASSPORT'],
  },
});

export default smileIdConfig;