/**
 * Webhook Verification Service
 *
 * @module signalforge/server/modules/payments/webhooks/verification
 */

import { PaymentProviderFactory } from '../providers/provider.factory.js';
import {
  WebhookVerificationError,
  UnsupportedPaymentProviderError,
} from '../payment.errors.js';
import { PAYMENT_PROVIDER_VALUES } from '../payment.constants.js';

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

export default WebhookVerificationService;