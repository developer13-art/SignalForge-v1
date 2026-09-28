/**
 * Payment Provider Factory
 *
 * @module signalforge/server/modules/payments/providers/factory
 */
const { StripeProvider } = require('./stripe.provider.js');
const { PaystackProvider } = require('./paystack.provider.js');
const { FlutterwaveProvider } = require('./flutterwave.provider.js');
const { PAYMENT_PROVIDERS } = require('../payment.constants.js');
const { UnsupportedPaymentProviderError } = require('../payment.errors.js');

const registry = new Map([
  [PAYMENT_PROVIDERS.STRIPE, () => new StripeProvider()],
  [PAYMENT_PROVIDERS.PAYSTACK, () => new PaystackProvider()],
  [PAYMENT_PROVIDERS.FLUTTERWAVE, () => new FlutterwaveProvider()],
]);
class PaymentProviderFactory {
  static register(providerName, factory) {
    if (typeof factory !== 'function') {
      throw new Error('Provider factory must be a function');
    }
    registry.set(providerName, factory);
  }

  static create(providerName) {
    const factory = registry.get(providerName);
    if (!factory) {
      throw new UnsupportedPaymentProviderError(undefined, { provider: providerName });
    }
    return factory();
  }

  static list() {
    return Array.from(registry.keys());
  }

  static isSupported(providerName) {
    return registry.has(providerName);
  }
}
module.exports = PaymentProviderFactory;
module.exports.PaymentProviderFactory = PaymentProviderFactory;
