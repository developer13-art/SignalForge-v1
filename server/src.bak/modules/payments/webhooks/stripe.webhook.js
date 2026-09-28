/**
 * Stripe Webhook Handler
 *
 * @module signalforge/server/modules/payments/webhooks/stripe
 */

import { WebhookVerificationService } from './webhook-verification.service.js';
import { PaymentEventService } from '../events/payment-event.service.js';
import { PaymentRepository } from '../payment.repository.js';
import {
  PAYMENT_STATUSES,
  PAYMENT_PROVIDERS,
} from '../payment.constants.js';
import {
  emitWebhookReceived,
  emitWebhookVerified,
  emitWebhookFailed,
  emitPaymentCompleted,
  emitPaymentFailed,
  emitPaymentDisputed,
} from '../payment.events.js';
import { getLogger } from '../../../bootstrap/initLogger.js';

export class StripeWebhookHandler {
  constructor(dependencies = {}) {
    this.verification =
      dependencies.verification || new WebhookVerificationService();
    this.eventService =
      dependencies.eventService || new PaymentEventService();
    this.repository = dependencies.repository || new PaymentRepository();
    this.logger = getLogger('stripe-webhook');
  }

  async handle(req) {
    const rawBody = req.rawBody || (Buffer.isBuffer(req.body) ? req.body.toString('utf8') : JSON.stringify(req.body));

    const { verified } = this.verification.verify(
      PAYMENT_PROVIDERS.STRIPE,
      rawBody,
      req.headers,
    );

    const parsed = this.verification.parse(PAYMENT_PROVIDERS.STRIPE, req.body);

    await emitWebhookReceived(
      PAYMENT_PROVIDERS.STRIPE,
      parsed.eventType,
      parsed.externalEventId,
    );
    await emitWebhookVerified(PAYMENT_PROVIDERS.STRIPE, parsed.externalEventId);

    const existing = await this.repository.findWebhookEvent(
      PAYMENT_PROVIDERS.STRIPE,
      parsed.externalEventId,
    );
    if (existing && existing.processed === true) {
      return { processed: true, duplicate: true };
    }

    const record =
      existing ||
      (await this.repository.createWebhookEvent({
        provider: PAYMENT_PROVIDERS.STRIPE,
        externalEventId: parsed.externalEventId,
        eventType: parsed.eventType,
        status: 'PROCESSING',
        payload: parsed.raw,
      }));

    try {
      await this.dispatch(parsed);
      if (record) {
        await this.repository.updateWebhookEvent(record.id, {
          status: 'COMPLETED',
          processed: true,
        });
      }
      return { processed: true };
    } catch (error) {
      if (record) {
        await this.repository.updateWebhookEvent(record.id, {
          status: 'FAILED',
          error: error.message,
        });
      }
      await emitWebhookFailed(PAYMENT_PROVIDERS.STRIPE, parsed.externalEventId, error);
      this.logger.error({ err: error }, 'Stripe webhook processing failed');
      throw error;
    }
  }

  async dispatch(parsed) {
    const data = parsed.data?.object || parsed.data || null;
    if (!data) {
      return;
    }

    switch (parsed.eventType) {
      case 'payment_intent.succeeded':
        await this.handleSucceeded(data);
        break;
      case 'payment_intent.payment_failed':
        await this.handleFailed(data);
        break;
      case 'charge.dispute.created':
        await this.handleDispute(data);
        break;
      case 'charge.refunded':
        await this.handleRefunded(data);
        break;
      default:
        this.logger.debug({ eventType: parsed.eventType }, 'Unhandled Stripe event');
    }
  }

  async handleSucceeded(data) {
    const externalPaymentId = data.id;
    const payment = await this.repository.findPaymentByExternalId(externalPaymentId);
    if (!payment) {
      return;
    }
    await this.repository.updatePayment(payment.id, {
      status: PAYMENT_STATUSES.SUCCEEDED,
      paidAt: new Date(),
    });
    await emitPaymentCompleted(payment.user_id, payment.id, payment.amount);
  }

  async handleFailed(data) {
    const externalPaymentId = data.id;
    const payment = await this.repository.findPaymentByExternalId(externalPaymentId);
    if (!payment) {
      return;
    }
    await this.repository.updatePayment(payment.id, {
      status: PAYMENT_STATUSES.FAILED,
      failedAt: new Date(),
      failureReason: data.last_payment_error?.message || 'Unknown failure',
    });
    await emitPaymentFailed(payment.user_id, payment.id, data.last_payment_error?.message);
  }

  async handleDispute(data) {
    const externalPaymentId = data.payment_intent || data.charge;
    const payment = await this.repository.findPaymentByExternalId(externalPaymentId);
    if (!payment) {
      return;
    }
    await this.repository.updatePayment(payment.id, {
      status: PAYMENT_STATUSES.DISPUTED,
    });
    await emitPaymentDisputed(payment.user_id, payment.id, data.reason);
  }

  async handleRefunded(data) {
    const externalPaymentId = data.payment_intent;
    const payment = await this.repository.findPaymentByExternalId(externalPaymentId);
    if (!payment) {
      return;
    }
    const refundedAmount = Number(data.amount_refunded || 0) / 100;
    const newStatus =
      refundedAmount >= Number(payment.amount)
        ? PAYMENT_STATUSES.REFUNDED
        : PAYMENT_STATUSES.PARTIALLY_REFUNDED;
    await this.repository.updatePayment(payment.id, {
      status: newStatus,
      refundedAmount,
    });
  }
}

export default StripeWebhookHandler;