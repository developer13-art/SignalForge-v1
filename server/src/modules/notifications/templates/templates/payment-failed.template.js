/**
 * Payment Failed Template
 *
 * @module server/modules/notifications/templates/templates/payment-failed
 */

export const PAYMENT_FAILED_TEMPLATE = Object.freeze({
  templateKey: 'PAYMENT_FAILED',
  channels: {
    IN_APP: {
      subject: 'Payment failed',
      bodyText: 'Your payment of {{amount}} {{currency}} failed. Please update your payment method.',
      bodyHtml: null,
      variables: ['amount', 'currency'],
    },
    EMAIL: {
      subject: 'Action required: payment failed',
      bodyText:
        'Hello {{firstName}},\n\nWe were unable to process your payment of {{amount}} {{currency}}.\n\nReason: {{reason}}\n\nPlease update your payment method to keep your subscription active.',
      bodyHtml:
        '<div style="font-family: Arial, sans-serif; max-width: 560px;"><h2>Payment failed</h2><p>Hello {{firstName}},</p><p>We were unable to process your payment of <strong>{{amount}} {{currency}}</strong>.</p><p><strong>Reason:</strong> {{reason}}</p><p>Please update your payment method to keep your subscription active.</p></div>',
      variables: ['firstName', 'amount', 'currency', 'reason'],
    },
  },
});

export default PAYMENT_FAILED_TEMPLATE;