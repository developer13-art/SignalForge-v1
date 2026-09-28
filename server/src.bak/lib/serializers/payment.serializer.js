/**
 * Payment Serializer
 *
 * @module server/lib/serializers/payment.serializer
 */

export function serializePayment(payment) {
  if (!payment) {
    return null;
  }

  return {
    paymentId: payment.id,
    userId: payment.user_id,
    subscriptionId: payment.subscription_id,
    amount: payment.amount,
    currency: payment.currency,
    provider: payment.provider,
    method: payment.method,
    status: payment.status,
    createdAt: payment.created_at,
    confirmedAt: payment.confirmed_at,
  };
}

export default serializePayment;