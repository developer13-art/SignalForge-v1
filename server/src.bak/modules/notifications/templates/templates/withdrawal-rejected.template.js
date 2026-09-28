/**
 * Withdrawal Rejected Template
 *
 * @module server/modules/notifications/templates/templates/withdrawal-rejected
 */

export const WITHDRAWAL_REJECTED_TEMPLATE = Object.freeze({
  templateKey: 'WITHDRAWAL_REJECTED',
  channels: {
    IN_APP: {
      subject: 'Withdrawal rejected',
      bodyText: 'Your withdrawal of {{amount}} {{currency}} was rejected. Reason: {{reason}}.',
      bodyHtml: null,
      variables: ['amount', 'currency', 'reason'],
    },
    EMAIL: {
      subject: 'Withdrawal request rejected',
      bodyText:
        'Hello {{firstName}},\n\nYour withdrawal request of {{amount}} {{currency}} was rejected.\n\nReason: {{reason}}\n\nIf you believe this is an error, please contact support.',
      bodyHtml:
        '<div style="font-family: Arial, sans-serif; max-width: 560px;"><h2>Withdrawal request rejected</h2><p>Hello {{firstName}},</p><p>Your withdrawal request of <strong>{{amount}} {{currency}}</strong> was rejected.</p><p><strong>Reason:</strong> {{reason}}</p><p>If you believe this is an error, please contact support.</p></div>',
      variables: ['firstName', 'amount', 'currency', 'reason'],
    },
  },
});

export default WITHDRAWAL_REJECTED_TEMPLATE;