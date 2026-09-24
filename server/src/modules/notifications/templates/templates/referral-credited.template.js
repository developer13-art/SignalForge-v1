/**
 * Referral Credited Template
 *
 * @module server/modules/notifications/templates/templates/referral-credited
 */

export const REFERRAL_CREDITED_TEMPLATE = Object.freeze({
  templateKey: 'REFERRAL_CREDITED',
  channels: {
    IN_APP: {
      subject: 'Referral reward credited',
      bodyText: 'You earned {{amount}} {{currency}} in referral rewards for the {{period}} period.',
      bodyHtml: null,
      variables: ['amount', 'currency', 'period'],
    },
    EMAIL: {
      subject: 'You earned {{amount}} {{currency}} in referral rewards',
      bodyText:
        'Hello {{firstName}},\n\nYou earned {{amount}} {{currency}} in referral rewards for the {{period}} settlement period.\n\nThe reward has been credited to your referral wallet.\n\nKeep sharing your referral link to earn more.',
      bodyHtml:
        '<div style="font-family: Arial, sans-serif; max-width: 560px;"><h2>Referral reward credited</h2><p>Hello {{firstName}},</p><p>You earned <strong>{{amount}} {{currency}}</strong> in referral rewards for the {{period}} settlement period.</p><p>The reward has been credited to your referral wallet.</p><p>Keep sharing your referral link to earn more.</p></div>',
      variables: ['firstName', 'amount', 'currency', 'period'],
    },
  },
});

export default REFERRAL_CREDITED_TEMPLATE;