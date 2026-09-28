/**
 * KYC Rejected Template
 *
 * @module server/modules/notifications/templates/templates/kyc-rejected
 */

export const KYC_REJECTED_TEMPLATE = Object.freeze({
  templateKey: 'KYC_REJECTED',
  channels: {
    EMAIL: {
      subject: 'KYC verification requires resubmission',
      bodyText:
        'Hello {{firstName}},\n\nUnfortunately, we could not verify your identity with the documents provided. Please review the reason below and resubmit.\n\nReason: {{reason}}\n\nYou can resubmit at any time from your account settings.',
      bodyHtml:
        '<div style="font-family: Arial, sans-serif; max-width: 560px;"><h2>KYC verification requires resubmission</h2><p>Hello {{firstName}},</p><p>Unfortunately, we could not verify your identity with the documents provided. Please review the reason below and resubmit.</p><p><strong>Reason:</strong> {{reason}}</p><p>You can resubmit at any time from your account settings.</p></div>',
      variables: ['firstName', 'reason'],
    },
    IN_APP: {
      subject: 'KYC verification requires resubmission',
      bodyText: 'We could not verify your identity. Please resubmit.',
      bodyHtml: null,
      variables: ['firstName', 'reason'],
    },
  },
});

export default KYC_REJECTED_TEMPLATE;