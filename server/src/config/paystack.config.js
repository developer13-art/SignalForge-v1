/**
 * Paystack Configuration
 *
 * Configures Paystack for the Nigerian market and other supported
 * African markets.
 *
 * @module signalforge/server/config/paystack
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

const paystackConfig = Object.freeze({
  enabled: toBoolean(process.env.PAYSTACK_ENABLED, true),
  secretKey: process.env.PAYSTACK_SECRET_KEY || null,
  publicKey: process.env.PAYSTACK_PUBLIC_KEY || null,
  webhookSecret: process.env.PAYSTACK_WEBHOOK_SECRET || null,

  baseUrl: process.env.PAYSTACK_BASE_URL || 'https://api.paystack.co',

  callbackUrl:
    process.env.PAYSTACK_CALLBACK_URL ||
    'http://localhost:3000/subscriptions/success',

  currency: process.env.PAYSTACK_CURRENCY || 'NGN',
  supportedCurrencies: ['NGN', 'GHS', 'ZAR', 'KES', 'USD'],

  channels: [
    'card',
    'bank',
    'ussd',
    'qr',
    'mobile_money',
    'bank_transfer',
  ],

  transaction: {
    initializeEndpoint: '/transaction/initialize',
    verifyEndpoint: '/transaction/verify',
    listEndpoint: '/transaction',
  },

  subscription: {
    createEndpoint: '/subscription',
    enableEndpoint: '/subscription/enable',
    disableEndpoint: '/subscription/disable',
    planEndpoint: '/plan',
    trialDays: toNumber(process.env.PAYSTACK_TRIAL_DAYS, 7),
  },

  webhook: {
    signatureHeader: 'x-paystack-signature',
    events: [
      'charge.success',
      'charge.failed',
      'subscription.create',
      'subscription.not_renew',
      'subscription.disable',
      'invoice.create',
      'invoice.payment_failed',
      'invoice.update',
      'transfer.success',
      'transfer.failed',
      'refund.processed',
    ],
  },

  retry: {
    maxAttempts: toNumber(process.env.PAYSTACK_RETRY_MAX_ATTEMPTS, 3),
    baseDelayMs: toNumber(process.env.PAYSTACK_RETRY_BASE_DELAY_MS, 2000),
  },

  timeoutMs: toNumber(process.env.PAYSTACK_TIMEOUT_MS, 30000),
});

export default paystackConfig;