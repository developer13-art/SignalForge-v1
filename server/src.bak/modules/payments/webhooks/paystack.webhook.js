/**
 * Paystack Webhook Handler
 *
 * @module signalforge/server/modules/payments/webhooks/paystack
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
} from '../payment.events.js';
import { getLogger } from '../../../bootstrap/initLogger.js';

export class PaystackWebhookHandler {
  constructor(dependencies = {}) {
    this.verification =
      dependencies.verification || new WebhookVerificationService();
    this.eventService =
      dependencies.eventService || new PaymentEventService();
    this.repository = dependencies.repository || new PaymentRepository();
    this.logger = getLogger('paystack-webhook');
  }

  async handle(req) {
    const rawBody = req.rawBody || (Buffer.isBuffer(req.body) ? req.body.toString('utf8') : JSON.stringify(req.body));

    const { verified } = this.verification.verify(
      PAYMENT_PROVIDERS.PAYSTACK,
      rawBody,
      req.headers,
    );

    const parsed = this.verification.parse(PAYMENT_PROVIDERS.PAYSTACK, req.body);

    await emitWebhookReceived(
      PAYMENT_PROVIDERS.PAYSTACK,
      parsed.eventType,
      parsed.externalEventId,
    );
    await emitWebhookVerified(PAYMENT_PROVIDERS.PAYSTACK, parsed.externalEventId);

    const existing = await this.repository.findWebhookEvent(
      PAYMENT_PROVIDERS.PAYSTACK,
      parsed.externalEventId,
    );
    if (existing && existing.processed === true) {
      return { processed: true, duplicate: true };
    }

    const record =
      existing ||
      (await this.repository.createWebhookEvent({
        provider: PAYMENT_PROVIDERS.PAYSTACK,
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
      await emitWebhookFailed(PAYMENT_PROVIDERS.PAYSTACK, parsed.externalEventId, error);
      this.logger.error({ err: error }, 'Paystack webhook processing failed');
      throw error;
    }
  }

  async dispatch(parsed) {
    const data = parsed.data;
    if (!data) {
      return;
    }

    const reference = data.reference;
    if (!reference) {
      return;
    }

    const payment = await this.repository.findPaymentByExternalId(reference);
    if (!payment) {
      return;
    }

    switch (parsed.eventType) {
      case 'charge.success':
        await this.repository.updatePayment(payment.id, {
          status: PAYMENT_STATUSES.SUCCEEDED,
          paidAt: new Date(),
        });
        await emitPaymentCompleted(payment.user_id, payment.id, payment.amount);
        break;
      case 'charge.failed':
        await this.repository.updatePayment(payment.id, {
          status: PAYMENT_STATUSES.FAILED,
          failedAt: new Date(),
          failureReason: data.gateway_response || 'Payment failed',
        });
        await emitPaymentFailed(payment.user_id, payment.id, data.gateway_response);
        break;
      default:
        this.logger.debug({ eventType: parsed.eventType }, 'Unhandled Paystack event');
    }
  }
}

export default PaystackWebhookHandler;