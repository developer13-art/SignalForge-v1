/**
 * Payment Successful Template
 *
 * @module server/modules/notifications/templates/templates/payment-successful
 */

export const PAYMENT_SUCCESSFUL_TEMPLATE = Object.freeze({
  templateKey: 'PAYMENT_SUCCESSFUL',
  channels: {
    IN_APP: {
      subject: 'Payment received',
      bodyText: 'Payment of {{amount}} {{currency}} has been received. Receipt: {{receiptId}}.',
      bodyHtml: null,
      variables: ['amount', 'currency', 'receiptId'],
    },
    EMAIL: {
      subject: 'Your SignalForge payment receipt',
      bodyText:
        'Hello {{firstName}},\n\nWe have received your payment.\n\nAmount: {{amount}} {{currency}}\nPayment method: {{method}}\nReceipt ID: {{receiptId}}\n\nThank you.',
      bodyHtml:
        '<div style="font-family: Arial, sans-serif; max-width: 560px;"><h2>Payment received</h2><p>Hello {{firstName}},</p><p>We have received your payment.</p><p><strong>Amount:</strong> {{amount}} {{currency}}</p><p><strong>Payment method:</strong> {{method}}</p><p><strong>Receipt ID:</strong> {{receiptId}}</p><p>Thank you.</p></div>',
      variables: ['firstName', 'amount', 'currency', 'method', 'receiptId'],
    },
  },
});

export default PAYMENT_SUCCESSFUL_TEMPLATE;