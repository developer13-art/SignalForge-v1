/**
 * Payment Intent Service
 *
 * @module signalforge/server/modules/payments/intents/service
 */

import crypto from 'node:crypto';

import { PaymentIntentRepository } from './repository.js';
import { PaymentRepository } from '../payment.repository.js';
import { PaymentProviderFactory } from '../providers/provider.factory.js';
import { InvoiceService } from '../invoices/invoice.service.js';
import {
  PAYMENT_STATUSES,
  PAYMENT_PROVIDERS,
  PAYMENT_PURPOSES,
} from '../payment.constants.js';
import { PaymentIntentNotFoundError, InvalidPaymentPayloadError } from '../payment.errors.js';
import {
  emitPaymentInitiated,
  emitPaymentPending,
} from '../payment.events.js';
import { getLogger } from '../../../bootstrap/initLogger.js';

const EXCHANGE_RATES_USD = Object.freeze({
  USD: 1,
  NGN: 1 / 1500,
  GHS: 1 / 12,
  ZAR: 1 / 18,
  KES: 1 / 130,
  EUR: 1.08,
  GBP: 1.27,
});

export class PaymentIntentService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new PaymentIntentRepository();
    this.paymentRepository = dependencies.paymentRepository || new PaymentRepository();
    this.invoices = dependencies.invoices || new InvoiceService({
      paymentRepository: this.paymentRepository,
    });
    this.logger = getLogger('payment-intent');
  }

  toUsd(amount, currency) {
    const rate = EXCHANGE_RATES_USD[currency] ?? 1;
    return Number((amount * rate).toFixed(2));
  }

  buildReference(provider, purpose) {
    const prefix = purpose === PAYMENT_PURPOSES.SUBSCRIPTION ? 'sf_sub' : 'sf_pay';
    return `${prefix}_${provider.toLowerCase()}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  }

  async createIntent(userId, payload, userEmail = null) {
    if (payload.provider === PAYMENT_PROVIDERS.INTERNAL_WALLET) {
      throw new InvalidPaymentPayloadError(
        'Internal wallet payments are handled by the wallet module',
      );
    }

    const provider = PaymentProviderFactory.create(payload.provider);
    if (!provider.isConfigured()) {
      throw new InvalidPaymentPayloadError(`Provider ${payload.provider} is not configured`);
    }

    const amountUsd = this.toUsd(payload.amount, payload.currency || 'USD');
    const reference = payload.reference || this.buildReference(payload.provider, payload.purpose);

    const intent = await this.repository.create({
      userId,
      purpose: payload.purpose,
      provider: payload.provider,
      amount: payload.amount,
      currency: payload.currency || 'USD',
      amountUsd,
      referenceId: payload.referenceId || null,
      status: PAYMENT_STATUSES.PENDING,
      metadata: payload.metadata || null,
    });

    let providerResult;
    try {
      providerResult = await provider.createPaymentIntent({
        userId,
        amount: payload.amount,
        currency: payload.currency || 'USD',
        purpose: payload.purpose,
        referenceId: payload.referenceId || null,
        reference,
        email: userEmail,
        description: payload.description,
      });
    } catch (error) {
      await this.repository.update(intent.id, { status: PAYMENT_STATUSES.FAILED });
      throw error;
    }

    await this.repository.update(intent.id, {
      status: PAYMENT_STATUSES.PROCESSING,
      externalIntentId: providerResult.externalIntentId,
      clientSecret: providerResult.clientSecret || null,
      metadata: {
        ...(payload.metadata || {}),
        authorizationUrl: providerResult.authorizationUrl || null,
        accessCode: providerResult.accessCode || null,
      },
    });

    const payment = await this.paymentRepository.createPayment({
      userId,
      intentId: intent.id,
      provider: payload.provider,
      amount: payload.amount,
      currency: payload.currency || 'USD',
      amountUsd,
      purpose: payload.purpose,
      referenceId: payload.referenceId || null,
      status: PAYMENT_STATUSES.PENDING,
      externalPaymentId: providerResult.externalIntentId,
      metadata: { reference },
    });

    await emitPaymentInitiated(userId, payment.id, payload.provider, payload.amount, {
      intentId: intent.id,
    });
    await emitPaymentPending(userId, payment.id, { intentId: intent.id });

    let invoice = null;
    if (payload.purpose === PAYMENT_PURPOSES.SUBSCRIPTION) {
      invoice = await this.invoices.createForPayment(userId, payment, payload);
    }

    const fullIntent = await this.repository.findById(intent.id);

    return {
      intent: this.serializeIntent(fullIntent),
      payment: this.serializePayment(payment),
      provider: {
        externalIntentId: providerResult.externalIntentId,
        clientSecret: providerResult.clientSecret || null,
        authorizationUrl: providerResult.authorizationUrl || null,
        accessCode: providerResult.accessCode || null,
      },
      invoice: invoice ? this.invoices.serialize(invoice) : null,
    };
  }

  async getIntent(userId, intentId) {
    const intent = await this.repository.findById(intentId);
    if (!intent || intent.user_id !== userId) {
      throw new PaymentIntentNotFoundError();
    }
    return this.serializeIntent(intent);
  }

  serializeIntent(row) {
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      userId: row.user_id,
      purpose: row.purpose,
      provider: row.provider,
      amount: row.amount,
      currency: row.currency,
      amountUsd: row.amount_usd,
      referenceId: row.reference_id,
      status: row.status,
      externalIntentId: row.external_intent_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  serializePayment(row) {
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      userId: row.user_id,
      intentId: row.intent_id,
      provider: row.provider,
      amount: row.amount,
      currency: row.currency,
      amountUsd: row.amount_usd,
      purpose: row.purpose,
      status: row.status,
      externalPaymentId: row.external_payment_id,
      createdAt: row.created_at,
    };
  }
}

export default PaymentIntentService;