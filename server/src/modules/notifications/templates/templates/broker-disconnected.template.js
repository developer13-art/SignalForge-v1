/**
 * Broker Disconnected Template
 *
 * @module server/modules/notifications/templates/templates/broker-disconnected
 */

export const BROKER_DISCONNECTED_TEMPLATE = Object.freeze({
  templateKey: 'BROKER_DISCONNECTED',
  channels: {
    IN_APP: {
      subject: 'Broker account disconnected',
      bodyText: 'Your broker account {{accountNickname}} has been disconnected. Automated trading is paused until the connection is restored.',
      bodyHtml: null,
      variables: ['accountNickname'],
    },
    PUSH: {
      subject: 'Broker account disconnected',
      bodyText: '{{accountNickname}} disconnected.',
      bodyHtml: null,
      variables: ['accountNickname'],
    },
    EMAIL: {
      subject: 'Broker account disconnected',
      bodyText:
        'Hello {{firstName}},\n\nYour broker account {{accountNickname}} has been disconnected. Automated trading is paused until the connection is restored.\n\nReason: {{reason}}\n\nPlease reconnect the account to resume.',
      bodyHtml:
        '<div style="font-family: Arial, sans-serif; max-width: 560px;"><h2>Broker account disconnected</h2><p>Hello {{firstName}},</p><p>Your broker account <strong>{{accountNickname}}</strong> has been disconnected. Automated trading is paused until the connection is restored.</p><p><strong>Reason:</strong> {{reason}}</p><p>Please reconnect the account to resume.</p></div>',
      variables: ['firstName', 'accountNickname', 'reason'],
    },
  },
});

export default BROKER_DISCONNECTED_TEMPLATE;