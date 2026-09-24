/**
 * Signal Executed Template
 *
 * @module server/modules/notifications/templates/templates/signal-executed
 */

export const SIGNAL_EXECUTED_TEMPLATE = Object.freeze({
  templateKey: 'SIGNAL_EXECUTED',
  channels: {
    IN_APP: {
      subject: 'Signal executed: {{direction}} {{symbol}}',
      bodyText: 'The signal {{direction}} {{symbol}} was executed on account {{accountNickname}} at {{price}}.',
      bodyHtml: null,
      variables: ['direction', 'symbol', 'accountNickname', 'price'],
    },
    PUSH: {
      subject: 'Trade executed',
      bodyText: '{{direction}} {{symbol}} executed on {{accountNickname}}.',
      bodyHtml: null,
      variables: ['direction', 'symbol', 'accountNickname'],
    },
    EMAIL: {
      subject: 'Signal executed: {{direction}} {{symbol}}',
      bodyText:
        'The signal was executed.\n\nDirection: {{direction}}\nSymbol: {{symbol}}\nEntry price: {{price}}\nVolume: {{volume}}\nAccount: {{accountNickname}}',
      bodyHtml:
        '<div style="font-family: Arial, sans-serif; max-width: 560px;"><h2>Signal executed</h2><p><strong>Direction:</strong> {{direction}}</p><p><strong>Symbol:</strong> {{symbol}}</p><p><strong>Entry price:</strong> {{price}}</p><p><strong>Volume:</strong> {{volume}}</p><p><strong>Account:</strong> {{accountNickname}}</p></div>',
      variables: ['direction', 'symbol', 'price', 'volume', 'accountNickname'],
    },
  },
});

export default SIGNAL_EXECUTED_TEMPLATE;