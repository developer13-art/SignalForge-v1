/**
 * Payment Provider Interface
 *
 * @module signalforge/server/modules/payments/providers/interface
 */

export class PaymentProviderInterface {
  constructor(name) {
    this.name = name;
  }

  isConfigured() {
    return false;
  }

  assertConfigured() {
    throw new Error(`${this.name} is not configured`);
  }

  async createPaymentIntent(intent) {
    throw new Error(`${this.name} must implement createPaymentIntent()`);
  }

  async retrievePaymentIntent(externalIntentId) {
    throw new Error(`${this.name} must implement retrievePaymentIntent()`);
  }

  async cancelPaymentIntent(externalIntentId) {
    throw new Error(`${this.name} must implement cancelPaymentIntent()`);
  }

  async createRefund(payment, amount) {
    throw new Error(`${this.name} must implement createRefund()`);
  }

  verifyWebhookSignature(rawBody, signatureHeader) {
    throw new Error(`${this.name} must implement verifyWebhookSignature()`);
  }

  parseWebhookEvent(payload) {
    throw new Error(`${this.name} must implement parseWebhookEvent()`);
  }
}

export default PaymentProviderInterface;