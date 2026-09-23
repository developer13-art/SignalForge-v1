/**
 * Stripe Payment Provider
 *
 * @module signalforge/server/modules/payments/providers/stripe
 */

import crypto from 'node:crypto';

import { PaymentProviderInterface } from './payment-provider.interface.js';
import stripeConfig from '../../../config/stripe.config.js';
import {
  PaymentProviderError,
  PaymentProviderNotConfiguredError,
  WebhookVerificationError,
} from '../payment.errors.js';

const TIMEOUT_MS = 30000;

export class StripeProvider extends PaymentProviderInterface {
  constructor(config = null) {
    super('STRIPE');
    this.config = config || stripeConfig;
  }

  isConfigured() {
    return Boolean(this.config.enabled && this.config.secretKey);
  }

  assertConfigured() {
    if (!this.isConfigured()) {
      throw new PaymentProviderNotConfiguredError('Stripe is not configured');
    }
  }

  buildHeaders() {
    return {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Bearer ${this.config.secretKey}`,
      'Stripe-Version': this.config.apiVersion || '2024-06-20',
    };
  }

  async fetchWithTimeout(url, options) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(new Error('TIMEOUT')), TIMEOUT_MS);
    try {
      return await fetch(url, { ...options, signal: controller.signal });
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new PaymentProviderError('Stripe request timed out');
      }
      throw new PaymentProviderError('Stripe request failed', {
        cause: error.message,
      });
    } finally {
      clearTimeout(timer);
    }
  }

  buildFormBody(params) {
    const form = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null) {
        continue;
      }
      if (typeof value === 'object') {
        for (const [subKey, subValue] of Object.entries(value)) {
          form.append(`${key}[${subKey}]`, String(subValue));
        }
      } else {
        form.append(key, String(value));
      }
    }
    return form;
  }

  async createPaymentIntent(intent) {
    this.assertConfigured();

    const body = this.buildFormBody({
      amount: Math.round(intent.amount * 100),
      currency: String(intent.currency || 'usd').toLowerCase(),
      'automatic_payment_methods[enabled]': 'true',
      'metadata[user_id]': intent.userId,
      'metadata[purpose]': intent.purpose,
      'metadata[reference_id]': intent.referenceId || '',
      description: intent.description || 'SignalForge payment',
    });

    const response = await this.fetchWithTimeout(`${this.config.baseUrl || 'https://api.stripe.com/v1'}/payment_intents`, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: body.toString(),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new PaymentProviderError(`Stripe responded with status ${response.status}`, {
        status: response.status,
        body: text,
      });
    }

    const data = await response.json();

    return {
      externalIntentId: data.id,
      clientSecret: data.client_secret,
      status: data.status,
      raw: data,
    };
  }

  async retrievePaymentIntent(externalIntentId) {
    this.assertConfigured();
    const response = await this.fetchWithTimeout(
      `${this.config.baseUrl || 'https://api.stripe.com/v1'}/payment_intents/${externalIntentId}`,
      { method: 'GET', headers: this.buildHeaders() },
    );
    if (!response.ok) {
      throw new PaymentProviderError('Failed to retrieve Stripe intent', {
        status: response.status,
      });
    }
    return response.json();
  }

  async cancelPaymentIntent(externalIntentId) {
    this.assertConfigured();
    const response = await this.fetchWithTimeout(
      `${this.config.baseUrl || 'https://api.stripe.com/v1'}/payment_intents/${externalIntentId}/cancel`,
      { method: 'POST', headers: this.buildHeaders() },
    );
    if (!response.ok) {
      throw new PaymentProviderError('Failed to cancel Stripe intent', {
        status: response.status,
      });
    }
    return response.json();
  }

  async createRefund(payment, amount) {
    this.assertConfigured();

    const body = this.buildFormBody({
      payment_intent: payment.external_payment_id,
      amount: Math.round(amount * 100),
      reason: 'requested_by_customer',
    });

    const response = await this.fetchWithTimeout(
      `${this.config.baseUrl || 'https://api.stripe.com/v1'}/refunds`,
      {
        method: 'POST',
        headers: this.buildHeaders(),
        body: body.toString(),
      },
    );

    if (!response.ok) {
      const text = await response.text();
      throw new PaymentProviderError('Stripe refund failed', {
        status: response.status,
        body: text,
      });
    }

    const data = await response.json();

    return {
      externalRefundId: data.id,
      status: data.status,
      raw: data,
    };
  }

  verifyWebhookSignature(rawBody, signatureHeader) {
    if (!this.config.webhookSecret) {
      throw new WebhookVerificationError('Stripe webhook secret is not configured');
    }
    if (!signatureHeader) {
      throw new WebhookVerificationError('Stripe signature header is missing');
    }

    const parts = String(signatureHeader).split(',');
    const timestampPart = parts.find((p) => p.startsWith('t='));
    const signaturePart = parts.find((p) => p.startsWith('v1='));

    if (!timestampPart || !signaturePart) {
      throw new WebhookVerificationError('Stripe signature header is malformed');
    }

    const timestamp = timestampPart.substring(2);
    const providedSignature = signaturePart.substring(3);

    const payload = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8');

    const expected = crypto
      .createHmac('sha256', this.config.webhookSecret)
      .update(`${timestamp}.${payload}`)
      .digest('hex');

    const providedBuffer = Buffer.from(providedSignature, 'hex');
    const expectedBuffer = Buffer.from(expected, 'hex');
    if (providedBuffer.length !== expectedBuffer.length) {
      throw new WebhookVerificationError('Stripe signature length mismatch');
    }
    if (!crypto.timingSafeEqual(providedBuffer, expectedBuffer)) {
      throw new WebhookVerificationError('Stripe signature invalid');
    }

    return { verified: true, timestamp };
  }

  parseWebhookEvent(payload) {
    const event = typeof payload === 'string' ? JSON.parse(payload) : payload;
    return {
      externalEventId: event.id,
      eventType: event.type,
      data: event.data || null,
      raw: event,
    };
  }
}

export default StripeProvider;