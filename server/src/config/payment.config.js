/**
 * Payment Configuration
 *
 * Configures payment processing for SignalForge subscriptions and
 * wallet funding, using Stripe for global markets, Paystack and
 * Flutterwave for the Nigerian market, and Solana for crypto.
 *
 * @module signalforge/server/config/payment
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

const paymentConfig = Object.freeze({
  enabled: true,
  defaultProvider: process.env.PAYMENT_DEFAULT_PROVIDER || 'stripe',

  supportedProviders: ['stripe', 'paystack', 'flutterwave', 'solana'],

  currencies: {
    default: process.env.PAYMENT_DEFAULT_CURRENCY || 'USD',
    supported: ['USD', 'EUR', 'GBP', 'NGN', 'GHS', 'ZAR', 'KES', 'SOL', 'USDC', 'USDT'],
  },

  subscription: {
    trialDays: toNumber(process.env.SUBSCRIPTION_TRIAL_DAYS, 7),
    gracePeriodDays: toNumber(process.env.SUBSCRIPTION_GRACE_PERIOD_DAYS, 3),
    retryIntervalDays: toNumber(process.env.SUBSCRIPTION_RETRY_INTERVAL_DAYS, 3),
    maxRetryAttempts: toNumber(process.env.SUBSCRIPTION_MAX_RETRY_ATTEMPTS, 4),
    prorationEnabled: toBoolean(process.env.SUBSCRIPTION_PRORATION_ENABLED, true),
    cancelAtPeriodEnd: toBoolean(process.env.SUBSCRIPTION_CANCEL_AT_PERIOD_END, true),
  },

  refunds: {
    enabled: toBoolean(process.env.PAYMENT_REFUNDS_ENABLED, true),
    windowDays: toNumber(process.env.PAYMENT_REFUND_WINDOW_DAYS, 14),
    requireApproval: toBoolean(process.env.PAYMENT_REFUND_REQUIRE_APPROVAL, true),
    maxRefundPercent: toNumber(process.env.PAYMENT_MAX_REFUND_PERCENT, 100),
  },

  fees: {
    platformFeePercent: toNumber(process.env.PAYMENT_PLATFORM_FEE_PERCENT, 3),
    providerFeePercent: toNumber(process.env.PAYMENT_PROVIDER_FEE_PERCENT, 10),
    minPayoutUsd: toNumber(process.env.PAYMENT_MIN_PAYOUT_USD, 10),
  },

  webhooks: {
    signatureVerification: true,
    toleranceSeconds: toNumber(process.env.PAYMENT_WEBHOOK_TOLERANCE_SECONDS, 300),
    maxRetries: toNumber(process.env.PAYMENT_WEBHOOK_MAX_RETRIES, 5),
    idempotencyWindowSeconds: toNumber(
      process.env.PAYMENT_WEBHOOK_IDEMPOTENCY_WINDOW_SECONDS,
      86400,
    ),
  },

  invoices: {
    prefix: process.env.PAYMENT_INVOICE_PREFIX || 'SF-INV',
    dueDays: toNumber(process.env.PAYMENT_INVOICE_DUE_DAYS, 7),
    pdfEnabled: toBoolean(process.env.PAYMENT_INVOICE_PDF_ENABLED, true),
  },

  security: {
    requireWebhookSignature: true,
    logSensitiveData: false,
    amountVerification: true,
    currencyVerification: true,
    maxAmountUsd: toNumber(process.env.PAYMENT_MAX_AMOUNT_USD, 10000),
  },
});

export default paymentConfig;