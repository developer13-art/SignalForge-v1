/**
 * Refund Service
 *
 * @module signalforge/server/modules/payments/refunds/service
 */

import { RefundRepository } from './repository.js';
import { PaymentRepository } from '../payment.repository.js';
import { PaymentProviderFactory } from '../providers/provider.factory.js';
import {
  PAYMENT_STATUSES,
  REFUND_STATUSES,
  DEFAULT_REFUND_WINDOW_DAYS,
} from '../payment.constants.js';
import {
  PaymentNotFoundError,
  RefundNotFoundError,
  RefundWindowExpiredError,
  InsufficientRefundableAmountError,
  RefundFailedError,
} from '../payment.errors.js';
import {
  emitRefundInitiated,
  emitRefundCompleted,
  emitRefundFailed,
  emitPaymentRefunded,
  emitPaymentPartiallyRefunded,
} from '../payment.events.js';

export class RefundService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new RefundRepository();
    this.paymentRepository = dependencies.paymentRepository || new PaymentRepository();
  }

  async refund(userId, paymentId, payload = {}) {
    const payment = await this.paymentRepository.findPaymentByIdForUser(paymentId, userId);
    if (!payment) {
      throw new PaymentNotFoundError();
    }

    if (
      ![PAYMENT_STATUSES.SUCCEEDED, PAYMENT_STATUSES.CONFIRMED, PAYMENT_STATUSES.PARTIALLY_REFUNDED].includes(
        payment.status,
      )
    ) {
      throw new RefundFailedError('Payment is not in a refundable state', {
        status: payment.status,
      });
    }

    const paidAt = payment.paid_at ? new Date(payment.paid_at).getTime() : 0;
    const windowMs = DEFAULT_REFUND_WINDOW_DAYS * 24 * 60 * 60 * 1000;
    if (paidAt > 0 && Date.now() - paidAt > windowMs) {
      throw new RefundWindowExpiredError();
    }

    const alreadyRefunded = await this.repository.sumForPayment(payment.id);
    const totalAmount = Number(payment.amount);
    const refundable = Math.max(0, totalAmount - alreadyRefunded);

    const requestedAmount = payload.amount ?? refundable;

    if (requestedAmount <= 0 || requestedAmount > refundable) {
      throw new InsufficientRefundableAmountError(undefined, {
        requestedAmount,
        refundable,
      });
    }

    const refund = await this.repository.create({
      paymentId: payment.id,
      userId,
      amount: requestedAmount,
      currency: payment.currency,
      amountUsd: payment.amount_usd ? Number((requestedAmount / Number(payment.amount)) * Number(payment.amount_usd)) : null,
      reason: payload.reason || null,
      status: REFUND_STATUSES.PENDING,
      requestedBy: userId,
    });

    await emitRefundInitiated(userId, refund.id, payment.id, requestedAmount);

    try {
      const provider = PaymentProviderFactory.create(payment.provider);
      const providerResult = await provider.createRefund(payment, requestedAmount);

      await this.repository.update(refund.id, {
        status: REFUND_STATUSES.PROCESSING,
        externalRefundId: providerResult.externalRefundId || null,
      });

      const newTotalRefunded = alreadyRefunded + requestedAmount;
      const fullyRefunded = newTotalRefunded >= totalAmount;

      await this.paymentRepository.updatePayment(payment.id, {
        status: fullyRefunded
          ? PAYMENT_STATUSES.REFUNDED
          : PAYMENT_STATUSES.PARTIALLY_REFUNDED,
        refundedAmount: newTotalRefunded,
      });

      await this.repository.update(refund.id, {
        status: REFUND_STATUSES.COMPLETED,
        processedAt: new Date(),
      });

      await emitRefundCompleted(userId, refund.id, payment.id, requestedAmount);

      if (fullyRefunded) {
        await emitPaymentRefunded(userId, payment.id, refund.id, requestedAmount);
      } else {
        await emitPaymentPartiallyRefunded(userId, payment.id, refund.id, requestedAmount);
      }

      const updated = await this.repository.findById(refund.id);
      return this.serialize(updated);
    } catch (error) {
      await this.repository.update(refund.id, {
        status: REFUND_STATUSES.FAILED,
        error: error.message,
      });
      await emitRefundFailed(userId, refund.id, payment.id, error);
      throw new RefundFailedError(error.message, { refundId: refund.id });
    }
  }

  async getRefund(userId, refundId) {
    const refund = await this.repository.findById(refundId);
    if (!refund || refund.user_id !== userId) {
      throw new RefundNotFoundError();
    }
    return this.serialize(refund);
  }

  async listRefundsForPayment(userId, paymentId) {
    const payment = await this.paymentRepository.findPaymentByIdForUser(paymentId, userId);
    if (!payment) {
      throw new PaymentNotFoundError();
    }
    const rows = await this.repository.findByPayment(payment.id);
    return rows.map((r) => this.serialize(r));
  }

  serialize(row) {
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      paymentId: row.payment_id,
      userId: row.user_id,
      amount: row.amount,
      currency: row.currency,
      amountUsd: row.amount_usd,
      reason: row.reason,
      status: row.status,
      externalRefundId: row.external_refund_id,
      requestedBy: row.requested_by,
      processedAt: row.processed_at,
      error: row.error,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

export default RefundService;