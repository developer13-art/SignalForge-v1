/**
 * Stripe Configuration
 *
 * Configures Stripe for global subscription billing and wallet
 * funding.
 *
 * @module signalforge/server/config/stripe
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

const stripeConfig = Object.freeze({
  enabled: toBoolean(process.env.STRIPE_ENABLED, true),
  secretKey: process.env.STRIPE_SECRET_KEY || null,
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || null,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || null,

  apiVersion: process.env.STRIPE_API_VERSION || '2024-06-20',

  successUrl:
    process.env.STRIPE_SUCCESS_URL ||
    'http://localhost:3000/subscriptions/success',
  cancelUrl:
    process.env.STRIPE_CANCEL_URL ||
    'http://localhost:3000/subscriptions/cancel',

  currency: process.env.STRIPE_CURRENCY || 'usd',
  locale: process.env.STRIPE_LOCALE || 'auto',

  paymentMethods: [
    'card',
    'apple_pay',
    'google_pay',
    'link',
  ],

  billing: {
    addressCollection: 'auto',
    taxIdCollection: toBoolean(process.env.STRIPE_TAX_ID_COLLECTION, false),
    automaticTax: toBoolean(process.env.STRIPE_AUTOMATIC_TAX, false),
  },

  checkout: {
    mode: 'subscription',
    allowPromotionCodes: toBoolean(process.env.STRIPE_ALLOW_PROMO_CODES, true),
    customerCreation: 'always',
    collectBillingAddress: toBoolean(process.env.STRIPE_COLLECT_BILLING_ADDRESS, true),
    collectShippingAddress: false,
    phoneNumberCollection: false,
  },

  subscription: {
    trialDays: toNumber(process.env.STRIPE_TRIAL_DAYS, 7),
    prorationBehavior: process.env.STRIPE_PRORATION_BEHAVIOR || 'create_prorations',
    cancelAtPeriodEnd: toBoolean(process.env.STRIPE_CANCEL_AT_PERIOD_END, true),
    paymentBehavior: process.env.STRIPE_PAYMENT_BEHAVIOR || 'default_incomplete',
  },

  webhook: {
    signatureToleranceSeconds: toNumber(process.env.STRIPE_WEBHOOK_TOLERANCE_SECONDS, 300),
    events: [
      'checkout.session.completed',
      'checkout.session.expired',
      'customer.subscription.created',
      'customer.subscription.updated',
      'customer.subscription.deleted',
      'customer.subscription.trial_will_end',
      'invoice.paid',
      'invoice.payment_failed',
      'invoice.payment_action_required',
      'payment_intent.succeeded',
      'payment_intent.payment_failed',
      'charge.refunded',
      'charge.dispute.created',
    ],
  },

  retry: {
    maxAttempts: toNumber(process.env.STRIPE_RETRY_MAX_ATTEMPTS, 3),
    baseDelayMs: toNumber(process.env.STRIPE_RETRY_BASE_DELAY_MS, 2000),
  },

  timeoutMs: toNumber(process.env.STRIPE_TIMEOUT_MS, 30000),
});

export default stripeConfig;