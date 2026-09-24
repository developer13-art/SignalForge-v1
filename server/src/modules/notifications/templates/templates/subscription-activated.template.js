/**
 * Subscription Activated Template
 *
 * @module server/modules/notifications/templates/templates/subscription-activated
 */

export const SUBSCRIPTION_ACTIVATED_TEMPLATE = Object.freeze({
  templateKey: 'SUBSCRIPTION_ACTIVATED',
  channels: {
    IN_APP: {
      subject: 'Subscription activated',
      bodyText: 'Your {{planName}} subscription is now active. Enjoy full access to SignalForge features.',
      bodyHtml: null,
      variables: ['planName'],
    },
    EMAIL: {
      subject: 'Your SignalForge subscription is active',
      bodyText:
        'Hello {{firstName}},\n\nYour {{planName}} subscription is now active. Thank you for choosing SignalForge.\n\nYou now have full access to automated trading, advanced analytics, marketplace features, and more.',
      bodyHtml:
        '<div style="font-family: Arial, sans-serif; max-width: 560px;"><h2>Subscription active</h2><p>Hello {{firstName}},</p><p>Your <strong>{{planName}}</strong> subscription is now active. Thank you for choosing SignalForge.</p><p>You now have full access to automated trading, advanced analytics, marketplace features, and more.</p></div>',
      variables: ['firstName', 'planName'],
    },
  },
});

export default SUBSCRIPTION_ACTIVATED_TEMPLATE;