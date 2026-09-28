/**
 * Payment Providers
 *
 * Defines the payment providers supported by SignalForge for
 * subscription billing, wallet funding, and withdrawals.
 *
 * @module @signalforge/shared/constants/payment-providers
 */const PAYMENT_PROVIDERS = Object.freeze({
  STRIPE: 'STRIPE',
  PAYSTACK: 'PAYSTACK',
  FLUTTERWAVE: 'FLUTTERWAVE',
  SOLANA: 'SOLANA',
  INTERNAL_WALLET: 'INTERNAL_WALLET',
});const PAYMENT_PROVIDER_VALUES = Object.freeze(Object.values(PAYMENT_PROVIDERS));const PAYMENT_PROVIDER_LABELS = Object.freeze({
  [PAYMENT_PROVIDERS.STRIPE]: 'Stripe',
  [PAYMENT_PROVIDERS.PAYSTACK]: 'Paystack',
  [PAYMENT_PROVIDERS.FLUTTERWAVE]: 'Flutterwave',
  [PAYMENT_PROVIDERS.SOLANA]: 'Solana',
  [PAYMENT_PROVIDERS.INTERNAL_WALLET]: 'Internal Wallet',
});const FIAT_PAYMENT_PROVIDERS = Object.freeze([
  PAYMENT_PROVIDERS.STRIPE,
  PAYMENT_PROVIDERS.PAYSTACK,
  PAYMENT_PROVIDERS.FLUTTERWAVE,
]);const CRYPTO_PAYMENT_PROVIDERS = Object.freeze([
  PAYMENT_PROVIDERS.SOLANA,
]);const SUPPORTED_CURRENCIES = Object.freeze({
  [PAYMENT_PROVIDERS.STRIPE]: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
  [PAYMENT_PROVIDERS.PAYSTACK]: ['NGN', 'GHS', 'ZAR', 'KES', 'USD'],
  [PAYMENT_PROVIDERS.FLUTTERWAVE]: ['NGN', 'GHS', 'ZAR', 'KES', 'USD', 'EUR', 'GBP'],
  [PAYMENT_PROVIDERS.SOLANA]: ['SOL', 'USDC', 'USDT'],
});function isValidPaymentProvider(provider) {
  return PAYMENT_PROVIDER_VALUES.includes(provider);
}function isCryptoProvider(provider) {
  return CRYPTO_PAYMENT_PROVIDERS.includes(provider);
}function isFiatProvider(provider) {
  return FIAT_PAYMENT_PROVIDERS.includes(provider);
}

module.exports.isValidPaymentProvider = isValidPaymentProvider;
module.exports.isCryptoProvider = isCryptoProvider;
module.exports.isFiatProvider = isFiatProvider;
module.exports.PAYMENT_PROVIDERS = PAYMENT_PROVIDERS;
module.exports.PAYMENT_PROVIDER_VALUES = PAYMENT_PROVIDER_VALUES;
module.exports.PAYMENT_PROVIDER_LABELS = PAYMENT_PROVIDER_LABELS;
module.exports.FIAT_PAYMENT_PROVIDERS = FIAT_PAYMENT_PROVIDERS;
module.exports.CRYPTO_PAYMENT_PROVIDERS = CRYPTO_PAYMENT_PROVIDERS;
module.exports.SUPPORTED_CURRENCIES = SUPPORTED_CURRENCIES;
