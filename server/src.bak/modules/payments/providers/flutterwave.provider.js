/**
 * Flutterwave Payment Provider
 *
 * @module signalforge/server/modules/payments/providers/flutterwave
 */

import crypto from 'node:crypto';

import { PaymentProviderInterface } from './payment-provider.interface.js';
import flutterwaveConfig from '../../../config/flutterwave.config.js';
import {
  PaymentProviderError,
  PaymentProviderNotConfiguredError,
  WebhookVerificationError,
} from '../payment.errors.js';

const TIMEOUT_MS = 30000;

export class FlutterwaveProvider extends PaymentProviderInterface {
  constructor(config = null) {
    super('FLUTTERWAVE');
    this.config = config || flutterwaveConfig;
  }

  isConfigured() {
    return Boolean(this.config.enabled && this.config.secretKey);
  }

  assertConfigured() {
    if (!this.isConfigured()) {
      throw new PaymentProviderNotConfiguredError('Flutterwave is not configured');
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
        throw new PaymentProviderError('Flutterwave request timed out');
      }
      throw new PaymentProviderError('Flutterwave request failed', {
        cause: error.message,
      });
    } finally {
      clearTimeout(timer);
    }
  }

  async createPaymentIntent(intent) {
    this.assertConfigured();

    const txRef = intent.reference || `flw_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

    const body = {
      tx_ref: txRef,
      amount: intent.amount,
      currency: intent.currency || this.config.currency || 'NGN',
      redirect_url: this.config.redirectUrl,
      customer: {
        email: intent.email || 'customer@signalforge.ai',
        name: intent.customerName || 'SignalForge Customer',
      },
      customizations: {
        title: 'SignalForge',
        description: intent.description || 'SignalForge payment',
      },
      meta: {
        user_id: intent.userId,
        purpose: intent.purpose,
        reference_id: intent.referenceId || null,
      },
    };

    const response = await this.fetchWithTimeout(`${this.config.baseUrl}${this.config.endpoints.initiatePayment}`, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new PaymentProviderError(`Flutterwave responded with status ${response.status}`, {
        status: response.status,
        body: text,
      });
    }

    const data = await response.json();
    if (data.status !== 'success' || !data.data) {
      throw new PaymentProviderError('Flutterwave returned an invalid response', { data });
    }

    return {
      externalIntentId: data.data.tx_ref || txRef,
      authorizationUrl: data.data.link,
      status: 'PENDING',
      raw: data,
    };
  }

  async retrievePaymentIntent(transactionId) {
    this.assertConfigured();
    const response = await this.fetchWithTimeout(
      `${this.config.baseUrl}${this.config.endpoints.verifyTransaction}/${transactionId}/verify`,
      { method: 'GET', headers: this.buildHeaders() },
    );
    if (!response.ok) {
      throw new PaymentProviderError('Failed to verify Flutterwave transaction', {
        status: response.status,
      });
    }
    return response.json();
  }

  async cancelPaymentIntent() {
    return { cancelled: false, reason: 'Flutterwave does not support intent cancellation' };
  }

  async createRefund(payment, amount) {
    this.assertConfigured();

    const body = { amount };

    const response = await this.fetchWithTimeout(
      `${this.config.baseUrl}${this.config.endpoints.refund}/${payment.external_payment_id}/refund`,
      {
        method: 'POST',
        headers: this.buildHeaders(),
        body: JSON.stringify(body),
      },
    );

    if (!response.ok) {
      const text = await response.text();
      throw new PaymentProviderError('Flutterwave refund failed', {
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
    if (!this.config.webhookSecret) {
      throw new WebhookVerificationError('Flutterwave webhook secret is not configured');
    }
    if (!signatureHeader) {
      throw new WebhookVerificationError('Flutterwave signature header is missing');
    }

    if (String(signatureHeader) !== String(this.config.webhookSecret)) {
      throw new WebhookVerificationError('Flutterwave signature invalid');
    }

    return { verified: true };
  }

  parseWebhookEvent(payload) {
    const event = typeof payload === 'string' ? JSON.parse(payload) : payload;
    const eventId = event.data?.id
      ? String(event.data.id)
      : `flw_${event.event || 'unknown'}_${Date.now()}`;

    return {
      externalEventId: eventId,
      eventType: event.event || event['event.type'] || 'unknown',
      data: event.data || null,
      raw: event,
    };
  }

  computeHash(rawBody) {
    return crypto.createHash('sha256').update(rawBody).digest('hex');
  }
}

export default FlutterwaveProvider;