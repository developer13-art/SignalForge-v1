/**
 * Referral Settled Template
 *
 * @module server/modules/notifications/templates/templates/referral-settled
 */

export const REFERRAL_SETTLED_TEMPLATE = Object.freeze({
  templateKey: 'REFERRAL_SETTLED',
  channels: {
    IN_APP: {
      subject: 'Referral settlement complete',
      bodyText: 'Your {{period}} referral settlement is complete. Total rewards: {{totalAmount}} {{currency}}.',
      bodyHtml: null,
      variables: ['period', 'totalAmount', 'currency'],
    },
    EMAIL: {
      subject: 'Your referral settlement for {{period}}',
      bodyText:
        'Hello {{firstName}},\n\nYour referral settlement for the {{period}} period is complete.\n\nTotal eligible net profit: {{totalEligibleProfit}} {{currency}}\nReferral rate: {{rewardRate}}%\nTotal rewards: {{totalAmount}} {{currency}}\n\nFunds are available in your referral wallet.',
      bodyHtml:
        '<div style="font-family: Arial, sans-serif; max-width: 560px;"><h2>Referral settlement complete</h2><p>Hello {{firstName}},</p><p>Your referral settlement for the {{period}} period is complete.</p><p><strong>Total eligible net profit:</strong> {{totalEligibleProfit}} {{currency}}</p><p><strong>Referral rate:</strong> {{rewardRate}}%</p><p><strong>Total rewards:</strong> {{totalAmount}} {{currency}}</p><p>Funds are available in your referral wallet.</p></div>',
      variables: ['firstName', 'period', 'totalEligibleProfit', 'rewardRate', 'totalAmount', 'currency'],
    },
  },
});

export default REFERRAL_SETTLED_TEMPLATE;