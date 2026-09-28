/**
 * Webhook Verification Service
 *
 * @module signalforge/server/modules/payments/webhooks/verification
 */
const { PaymentProviderFactory } = require('../providers/provider.factory.js');
const { WebhookVerificationError, UnsupportedPaymentProviderError } = require('../payment.errors.js');
const { PAYMENT_PROVIDER_VALUES } = require('../payment.constants.js');

export class WebhookVerificationService {
  verify(providerName, rawBody, headers = {}) {
    if (!PAYMENT_PROVIDER_VALUES.includes(providerName)) {
      throw new UnsupportedPaymentProviderError(undefined, { provider: providerName });
    }

    const provider = PaymentProviderFactory.create(providerName);

    let signatureHeader = null;
    switch (providerName) {
      case 'STRIPE':
        signatureHeader = headers['stripe-signature'];
        break;
      case 'PAYSTACK':
        signatureHeader = headers['x-paystack-signature'];
        break;
      case 'FLUTTERWAVE':
        signatureHeader = headers['verif-hash'];
        break;
      default:
        signatureHeader = headers['x-webhook-signature'] || null;
    }

    if (!signatureHeader) {
      throw new WebhookVerificationError('Webhook signature header is missing', {
        provider: providerName,
      });
    }

    return provider.verifyWebhookSignature(rawBody, signatureHeader);
  }

  parse(providerName, payload) {
    const provider = PaymentProviderFactory.create(providerName);
    return provider.parseWebhookEvent(payload);
  }
}
module.exports = WebhookVerificationService;