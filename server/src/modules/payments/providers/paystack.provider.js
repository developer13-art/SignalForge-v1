/**
 * Paystack Payment Provider
 *
 * @module signalforge/server/modules/payments/providers/paystack
 */

import crypto from 'node:crypto';

import { PaymentProviderInterface } from './payment-provider.interface.js';
import paystackConfig from '../../../config/paystack.config.js';
import {
  PaymentProviderError,
  PaymentProviderNotConfiguredError,
  WebhookVerificationError,
} from '../payment.errors.js';

const TIMEOUT_MS = 30000;

export class PaystackProvider extends PaymentProviderInterface {
  constructor(config = null) {
    super('PAYSTACK');
    this.config = config || paystackConfig;
  }

  isConfigured() {
    return Boolean(this.config.enabled && this.config.secretKey);
  }

  assertConfigured() {
    if (!this.isConfigured()) {
      throw new PaymentProviderNotConfiguredError('Paystack is not configured');
    }
  }

  buildHeaders() {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.config.secretKey}`,
    };
  }

  async fetchWithTimeout(url, options) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(new Error('TIMEOUT')), TIMEOUT_MS);
    try {
      return await fetch(url, { ...options, signal: controller.signal });
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new PaymentProviderError('Paystack request timed out');
      }
      throw new PaymentProviderError('Paystack request failed', { cause: error.message });
    } finally {
      clearTimeout(timer);
    }
  }

  async createPaymentIntent(intent) {
    this.assertConfigured();

    const body = {
      email: intent.email || 'customer@signalforge.ai',
      amount: Math.round(intent.amount * 100),
      currency: intent.currency || this.config.currency || 'NGN',
      reference: intent.reference || `ps_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
      callback_url: this.config.callbackUrl,
      metadata: {
        user_id: intent.userId,
        purpose: intent.purpose,
        reference_id: intent.referenceId || null,
      },
    };

    const response = await this.fetchWithTimeout(`${this.config.baseUrl}/transaction/initialize`, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new PaymentProviderError(`Paystack responded with status ${response.status}`, {
        status: response.status,
        body: text,
      });
    }

    const data = await response.json();
    if (!data.status || !data.data) {
      throw new PaymentProviderError('Paystack returned an invalid response', { data });
    }

    return {
      externalIntentId: data.data.reference,
      authorizationUrl: data.data.authorization_url,
      accessCode: data.data.access_code,
      status: 'PENDING',
      raw: data,
    };
  }

  async retrievePaymentIntent(reference) {
    this.assertConfigured();
    const response = await this.fetchWithTimeout(
      `${this.config.baseUrl}/transaction/verify/${reference}`,
      { method: 'GET', headers: this.buildHeaders() },
    );
    if (!response.ok) {
      throw new PaymentProviderError('Failed to verify Paystack transaction', {
        status: response.status,
      });
    }
    return response.json();
  }

  async cancelPaymentIntent(reference) {
    return { cancelled: false, reason: 'Paystack does not support intent cancellation' };
  }

  async createRefund(payment, amount) {
    this.assertConfigured();

    const body = {
      transaction: payment.external_payment_id,
      amount: Math.round(amount * 100),
    };

    const response = await this.fetchWithTimeout(`${this.config.baseUrl}/refund`, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new PaymentProviderError('Paystack refund failed', {
        status: response.status,
        body: text,
      });
    }

    const data = await response.json();

    return {
      externalRefundId: data.data?.id || null,
      status: data.data?.status || 'processing',
      raw: data,
    };
  }

  verifyWebhookSignature(rawBody, signatureHeader) {
    if (!this.config.secretKey) {
      throw new WebhookVerificationError('Paystack secret key is not configured');
    }
    if (!signatureHeader) {
      throw new WebhookVerificationError('Paystack signature header is missing');
    }

    const payload = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8');

    const expected = crypto
      .createHmac('sha512', this.config.secretKey)
      .update(payload)
      .digest('hex');

    const providedBuffer = Buffer.from(signatureHeader, 'hex');
    const expectedBuffer = Buffer.from(expected, 'hex');
    if (providedBuffer.length !== expectedBuffer.length) {
      throw new WebhookVerificationError('Paystack signature length mismatch');
    }
    if (!crypto.timingSafeEqual(providedBuffer, expectedBuffer)) {
      throw new WebhookVerificationError('Paystack signature invalid');
    }

    return { verified: true };
  }

  parseWebhookEvent(payload) {
    const event = typeof payload === 'string' ? JSON.parse(payload) : payload;
    return {
      externalEventId: event.data?.id?.toString() || event.data?.reference || `${event.event}_${Date.now()}`,
      eventType: event.event,
      data: event.data || null,
      raw: event,
    };
  }
}

export default PaystackProvider;