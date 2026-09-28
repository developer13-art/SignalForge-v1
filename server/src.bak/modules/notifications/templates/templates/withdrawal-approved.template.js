/**
 * Withdrawal Approved Template
 *
 * @module server/modules/notifications/templates/templates/withdrawal-approved
 */

export const WITHDRAWAL_APPROVED_TEMPLATE = Object.freeze({
  templateKey: 'WITHDRAWAL_APPROVED',
  channels: {
    IN_APP: {
      subject: 'Withdrawal approved',
      bodyText: 'Your withdrawal of {{amount}} {{currency}} has been approved. Funds will arrive shortly.',
      bodyHtml: null,
      variables: ['amount', 'currency'],
    },
    EMAIL: {
      subject: 'Withdrawal approved',
      bodyText:
        'Hello {{firstName}},\n\nYour withdrawal request has been approved.\n\nAmount: {{amount}} {{currency}}\nMethod: {{method}}\nExpected arrival: {{expectedArrival}}\n\nThank you.',
      bodyHtml:
        '<div style="font-family: Arial, sans-serif; max-width: 560px;"><h2>Withdrawal approved</h2><p>Hello {{firstName}},</p><p>Your withdrawal request has been approved.</p><p><strong>Amount:</strong> {{amount}} {{currency}}</p><p><strong>Method:</strong> {{method}}</p><p><strong>Expected arrival:</strong> {{expectedArrival}}</p><p>Thank you.</p></div>',
      variables: ['firstName', 'amount', 'currency', 'method', 'expectedArrival'],
    },
  },
});

export default WITHDRAWAL_APPROVED_TEMPLATE;