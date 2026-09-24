/**
 * Subscription Expiring Template
 *
 * @module server/modules/notifications/templates/templates/subscription-expiring
 */

export const SUBSCRIPTION_EXPIRING_TEMPLATE = Object.freeze({
  templateKey: 'SUBSCRIPTION_EXPIRING',
  channels: {
    IN_APP: {
      subject: 'Subscription expiring soon',
      bodyText: 'Your subscription will expire in {{daysRemaining}} days. Renew to keep automation active.',
      bodyHtml: null,
      variables: ['daysRemaining'],
    },
    EMAIL: {
      subject: 'Subscription expiring in {{daysRemaining}} days',
      bodyText:
        'Hello {{firstName}},\n\nYour subscription will expire in {{daysRemaining}} days. Renew to keep your automated trading and other features active.\n\nIf you have auto-renew enabled, no action is needed.',
      bodyHtml:
        '<div style="font-family: Arial, sans-serif; max-width: 560px;"><h2>Subscription expiring soon</h2><p>Hello {{firstName}},</p><p>Your subscription will expire in <strong>{{daysRemaining}} days</strong>. Renew to keep your automated trading and other features active.</p><p>If you have auto-renew enabled, no action is needed.</p></div>',
      variables: ['firstName', 'daysRemaining'],
    },
  },
});

export default SUBSCRIPTION_EXPIRING_TEMPLATE;