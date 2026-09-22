/**
 * Payment Providers
 *
 * Defines the payment providers supported by SignalForge for
 * subscription billing, wallet funding, and withdrawals.
 *
 * @module @signalforge/shared/constants/payment-providers
 */

export const PAYMENT_PROVIDERS = Object.freeze({
  STRIPE: 'STRIPE',
  PAYSTACK: 'PAYSTACK',
  FLUTTERWAVE: 'FLUTTERWAVE',
  SOLANA: 'SOLANA',
  INTERNAL_WALLET: 'INTERNAL_WALLET',
});

export const PAYMENT_PROVIDER_VALUES = Object.freeze(Object.values(PAYMENT_PROVIDERS));

export const PAYMENT_PROVIDER_LABELS = Object.freeze({
  [PAYMENT_PROVIDERS.STRIPE]: 'Stripe',
  [PAYMENT_PROVIDERS.PAYSTACK]: 'Paystack',
  [PAYMENT_PROVIDERS.FLUTTERWAVE]: 'Flutterwave',
  [PAYMENT_PROVIDERS.SOLANA]: 'Solana',
  [PAYMENT_PROVIDERS.INTERNAL_WALLET]: 'Internal Wallet',
});

export const FIAT_PAYMENT_PROVIDERS = Object.freeze([
  PAYMENT_PROVIDERS.STRIPE,
  PAYMENT_PROVIDERS.PAYSTACK,
  PAYMENT_PROVIDERS.FLUTTERWAVE,
]);

export const CRYPTO_PAYMENT_PROVIDERS = Object.freeze([
  PAYMENT_PROVIDERS.SOLANA,
]);

export const SUPPORTED_CURRENCIES = Object.freeze({
  [PAYMENT_PROVIDERS.STRIPE]: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
  [PAYMENT_PROVIDERS.PAYSTACK]: ['NGN', 'GHS', 'ZAR', 'KES', 'USD'],
  [PAYMENT_PROVIDERS.FLUTTERWAVE]: ['NGN', 'GHS', 'ZAR', 'KES', 'USD', 'EUR', 'GBP'],
  [PAYMENT_PROVIDERS.SOLANA]: ['SOL', 'USDC', 'USDT'],
});

export function isValidPaymentProvider(provider) {
  return PAYMENT_PROVIDER_VALUES.includes(provider);
}

export function isCryptoProvider(provider) {
  return CRYPTO_PAYMENT_PROVIDERS.includes(provider);
}

export function isFiatProvider(provider) {
  return FIAT_PAYMENT_PROVIDERS.includes(provider);
}