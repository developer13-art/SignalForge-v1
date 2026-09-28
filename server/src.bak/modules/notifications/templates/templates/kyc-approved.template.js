/**
 * KYC Approved Template
 *
 * @module server/modules/notifications/templates/templates/kyc-approved
 */

export const KYC_APPROVED_TEMPLATE = Object.freeze({
  templateKey: 'KYC_APPROVED',
  channels: {
    EMAIL: {
      subject: 'Your identity has been verified',
      bodyText:
        'Hello {{firstName}},\n\nYour identity verification has been approved. You now have full access to all platform features, including trading automation, subscriptions, and the referral program.\n\nWelcome aboard.',
      bodyHtml:
        '<div style="font-family: Arial, sans-serif; max-width: 560px;"><h2>Identity verified</h2><p>Hello {{firstName}},</p><p>Your identity verification has been approved. You now have full access to all platform features, including trading automation, subscriptions, and the referral program.</p><p>Welcome aboard.</p></div>',
      variables: ['firstName'],
    },
    IN_APP: {
      subject: 'Identity verified',
      bodyText: 'Your identity verification has been approved.',
      bodyHtml: null,
      variables: ['firstName'],
    },
  },
});

export default KYC_APPROVED_TEMPLATE;