/**
 * Flutterwave Configuration
 *
 * Configures Flutterwave for African markets.
 *
 * @module signalforge/server/config/flutterwave
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

const flutterwaveConfig = Object.freeze({
  enabled: toBoolean(process.env.FLUTTERWAVE_ENABLED, false),
  secretKey: process.env.FLUTTERWAVE_SECRET_KEY || null,
  publicKey: process.env.FLUTTERWAVE_PUBLIC_KEY || null,
  encryptionKey: process.env.FLUTTERWAVE_ENCRYPTION_KEY || null,
  webhookSecret: process.env.FLUTTERWAVE_WEBHOOK_SECRET || null,

  baseUrl: process.env.FLUTTERWAVE_BASE_URL || 'https://api.flutterwave.com/v3',

  redirectUrl:
    process.env.FLUTTERWAVE_REDIRECT_URL ||
    'http://localhost:3000/subscriptions/success',

  currency: process.env.FLUTTERWAVE_CURRENCY || 'NGN',
  supportedCurrencies: ['NGN', 'GHS', 'ZAR', 'KES', 'USD', 'EUR', 'GBP'],

  paymentOptions: [
    'card',
    'banktransfer',
    'ussd',
    'mobilemoney',
    'barter',
  ],

  endpoints: {
    initiatePayment: '/payments',
    verifyTransaction: '/transactions',
    createPlan: '/payment-plans',
    refund: '/transactions',
  },

  webhook: {
    signatureHeader: 'verif-hash',
    events: [
      'charge.completed',
      'charge.failed',
      'transfer.completed',
      'subscription.cancelled',
      'refund.completed',
    ],
  },

  retry: {
    maxAttempts: toNumber(process.env.FLUTTERWAVE_RETRY_MAX_ATTEMPTS, 3),
    baseDelayMs: toNumber(process.env.FLUTTERWAVE_RETRY_BASE_DELAY_MS, 2000),
  },

  timeoutMs: toNumber(process.env.FLUTTERWAVE_TIMEOUT_MS, 30000),
});

export default flutterwaveConfig;