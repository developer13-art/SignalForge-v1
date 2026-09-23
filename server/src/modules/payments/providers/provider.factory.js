/**
 * Payment Provider Factory
 *
 * @module signalforge/server/modules/payments/providers/factory
 */

import { StripeProvider } from './stripe.provider.js';
import { PaystackProvider } from './paystack.provider.js';
import { FlutterwaveProvider } from './flutterwave.provider.js';
import { PAYMENT_PROVIDERS } from '../payment.constants.js';
import { UnsupportedPaymentProviderError } from '../payment.errors.js';

const registry = new Map([
  [PAYMENT_PROVIDERS.STRIPE, () => new StripeProvider()],
  [PAYMENT_PROVIDERS.PAYSTACK, () => new PaystackProvider()],
  [PAYMENT_PROVIDERS.FLUTTERWAVE, () => new FlutterwaveProvider()],
]);

export class PaymentProviderFactory {
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

export default PaymentProviderFactory;