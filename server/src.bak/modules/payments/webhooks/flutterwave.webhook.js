/**
 * Flutterwave Webhook Handler
 *
 * @module signalforge/server/modules/payments/webhooks/flutterwave
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

export class FlutterwaveWebhookHandler {
  constructor(dependencies = {}) {
    this.verification =
      dependencies.verification || new WebhookVerificationService();
    this.eventService =
      dependencies.eventService || new PaymentEventService();
    this.repository = dependencies.repository || new PaymentRepository();
    this.logger = getLogger('flutterwave-webhook');
  }

  async handle(req) {
    const rawBody = req.rawBody || (Buffer.isBuffer(req.body) ? req.body.toString('utf8') : JSON.stringify(req.body));

    const { verified } = this.verification.verify(
      PAYMENT_PROVIDERS.FLUTTERWAVE,
      rawBody,
      req.headers,
    );

    const parsed = this.verification.parse(PAYMENT_PROVIDERS.FLUTTERWAVE, req.body);

    await emitWebhookReceived(
      PAYMENT_PROVIDERS.FLUTTERWAVE,
      parsed.eventType,
      parsed.externalEventId,
    );
    await emitWebhookVerified(PAYMENT_PROVIDERS.FLUTTERWAVE, parsed.externalEventId);

    const existing = await this.repository.findWebhookEvent(
      PAYMENT_PROVIDERS.FLUTTERWAVE,
      parsed.externalEventId,
    );
    if (existing && existing.processed === true) {
      return { processed: true, duplicate: true };
    }

    const record =
      existing ||
      (await this.repository.createWebhookEvent({
        provider: PAYMENT_PROVIDERS.FLUTTERWAVE,
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
      await emitWebhookFailed(PAYMENT_PROVIDERS.FLUTTERWAVE, parsed.externalEventId, error);
      this.logger.error({ err: error }, 'Flutterwave webhook processing failed');
      throw error;
    }
  }

  async dispatch(parsed) {
    const data = parsed.data;
    if (!data) {
      return;
    }

    const reference = data.tx_ref || data.reference;
    if (!reference) {
      return;
    }

    const payment = await this.repository.findPaymentByExternalId(reference);
    if (!payment) {
      return;
    }

    switch (parsed.eventType) {
      case 'charge.completed':
      case 'charge.success':
        if (String(data.status).toLowerCase() === 'successful' || data.status === 'successful') {
          await this.repository.updatePayment(payment.id, {
            status: PAYMENT_STATUSES.SUCCEEDED,
            paidAt: new Date(),
          });
          await emitPaymentCompleted(payment.user_id, payment.id, payment.amount);
        } else {
          await this.repository.updatePayment(payment.id, {
            status: PAYMENT_STATUSES.FAILED,
            failedAt: new Date(),
            failureReason: data.processor_response || 'Payment failed',
          });
          await emitPaymentFailed(payment.user_id, payment.id, data.processor_response);
        }
        break;
      case 'charge.failed':
        await this.repository.updatePayment(payment.id, {
          status: PAYMENT_STATUSES.FAILED,
          failedAt: new Date(),
          failureReason: data.processor_response || 'Payment failed',
        });
        await emitPaymentFailed(payment.user_id, payment.id, data.processor_response);
        break;
      default:
        this.logger.debug({ eventType: parsed.eventType }, 'Unhandled Flutterwave event');
    }
  }
}

export default FlutterwaveWebhookHandler;