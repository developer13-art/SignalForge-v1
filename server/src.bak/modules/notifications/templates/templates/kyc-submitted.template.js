/**
 * KYC Submitted Template
 *
 * @module server/modules/notifications/templates/templates/kyc-submitted
 */

export const KYC_SUBMITTED_TEMPLATE = Object.freeze({
  templateKey: 'KYC_SUBMITTED',
  channels: {
    EMAIL: {
      subject: 'KYC submission received',
      bodyText:
        'Hello {{firstName}},\n\nWe have received your KYC submission and it is now under review. You will be notified when the review is complete.\n\nThank you.',
      bodyHtml:
        '<div style="font-family: Arial, sans-serif; max-width: 560px;"><h2>KYC submission received</h2><p>Hello {{firstName}},</p><p>We have received your KYC submission and it is now under review. You will be notified when the review is complete.</p><p>Thank you.</p></div>',
      variables: ['firstName'],
    },
    IN_APP: {
      subject: 'KYC submission received',
      bodyText: 'Your KYC submission is under review.',
      bodyHtml: null,
      variables: ['firstName'],
    },
  },
});

export default KYC_SUBMITTED_TEMPLATE;