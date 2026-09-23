/**
 * Payment Service (facade)
 *
 * @module signalforge/server/modules/payments/service
 */

import { PaymentRepository } from './payment.repository.js';
import { PaymentIntentService } from './intents/payment-intent.service.js';
import { InvoiceService } from './invoices/invoice.service.js';
import { RefundService } from './refunds/refund.service.js';
import { PaymentEventService } from './events/payment-event.service.js';
import { WebhookVerificationService } from './webhooks/webhook-verification.service.js';
import { PaymentProviderFactory } from './providers/provider.factory.js';
import {
  PAYMENT_STATUSES,
  PAYMENT_PROVIDERS,
} from './payment.constants.js';
import {
  PaymentNotFoundError,
  PaymentProviderNotConfiguredError,
} from './payment.errors.js';

export class PaymentService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new PaymentRepository();
    this.intents =
      dependencies.intents ||
      new PaymentIntentService({
        repository: dependencies.intentRepository,
        paymentRepository: this.repository,
      });
    this.invoices =
      dependencies.invoices ||
      new InvoiceService({ paymentRepository: this.repository });
    this.refunds =
      dependencies.refunds ||
      new RefundService({ paymentRepository: this.repository });
    this.events =
      dependencies.events || new PaymentEventService(dependencies.eventRepository);
    this.verification =
      dependencies.verification || new WebhookVerificationService();
  }

  async createPayment(userId, payload, userEmail) {
    return this.intents.createIntent(userId, payload, userEmail);
  }

  async getPayment(userId, paymentId) {
    const row = await this.repository.findPaymentByIdForUser(paymentId, userId);
    if (!row) {
      throw new PaymentNotFoundError();
    }
    return this.serialize(row);
  }

  async listPayments(filters, pagination) {
    const result = await this.repository.listPayments(filters, pagination);
    return {
      payments: result.payments.map((p) => this.serialize(p)),
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    };
  }

  async getPaymentStatusCounts(filters) {
    return this.repository.countByStatus(filters);
  }

  async getRevenueSummary(filters) {
    return this.repository.sumRevenue(filters);
  }

  async markPaymentSucceeded(paymentId) {
    const payment = await this.repository.findPaymentById(paymentId);
    if (!payment) {
      throw new PaymentNotFoundError();
    }
    return this.repository.updatePayment(payment.id, {
      status: PAYMENT_STATUSES.SUCCEEDED,
      paidAt: new Date(),
    });
  }

  async markPaymentFailed(paymentId, reason) {
    const payment = await this.repository.findPaymentById(paymentId);
    if (!payment) {
      throw new PaymentNotFoundError();
    }
    return this.repository.updatePayment(payment.id, {
      status: PAYMENT_STATUSES.FAILED,
      failedAt: new Date(),
      failureReason: reason || 'Unknown failure',
    });
  }

  async refundPayment(userId, paymentId, payload) {
    return this.refunds.refund(userId, paymentId, payload);
  }

  async getRefund(userId, refundId) {
    return this.refunds.getRefund(userId, refundId);
  }

  async listRefundsForPayment(userId, paymentId) {
    return this.refunds.listRefundsForPayment(userId, paymentId);
  }

  async getInvoice(userId, invoiceId) {
    return this.invoices.getInvoice(userId, invoiceId);
  }

  async listInvoices(userId, filters, pagination) {
    return this.invoices.listInvoices(userId, filters, pagination);
  }

  async voidInvoice(userId, invoiceId) {
    return this.invoices.voidInvoice(userId, invoiceId);
  }

  async getIntent(userId, intentId) {
    return this.intents.getIntent(userId, intentId);
  }

  verifyWebhook(providerName, rawBody, headers) {
    return this.verification.verify(providerName, rawBody, headers);
  }

  parseWebhook(providerName, payload) {
    return this.verification.parse(providerName, payload);
  }

  getAvailableProviders() {
    return PaymentProviderFactory.list().filter((name) => {
      try {
        const provider = PaymentProviderFactory.create(name);
        return provider.isConfigured();
      } catch {
        return false;
      }
    });
  }

  getProviderAvailability() {
    return PaymentProviderFactory.list().map((name) => {
      try {
        const provider = PaymentProviderFactory.create(name);
        return { provider: name, configured: provider.isConfigured() };
      } catch {
        return { provider: name, configured: false };
      }
    });
  }

  serialize(row) {
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
      referenceId: row.reference_id,
      status: row.status,
      externalPaymentId: row.external_payment_id,
      externalCustomerId: row.external_customer_id,
      paidAt: row.paid_at,
      failedAt: row.failed_at,
      failureReason: row.failure_reason,
      refundedAmount: row.refunded_amount,
      metadata: this.parseJson(row.metadata),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  parseJson(input) {
    if (!input) {
      return null;
    }
    if (typeof input === 'string') {
      try {
        return JSON.parse(input);
      } catch {
        return null;
      }
    }
    return input;
  }
}

export default PaymentService;