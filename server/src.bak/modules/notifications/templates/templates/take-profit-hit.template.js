/**
 * Take Profit Hit Template
 *
 * @module server/modules/notifications/templates/templates/take-profit-hit
 */

export const TAKE_PROFIT_HIT_TEMPLATE = Object.freeze({
  templateKey: 'TAKE_PROFIT_HIT',
  channels: {
    IN_APP: {
      subject: 'Take profit hit: {{symbol}}',
      bodyText: 'Take profit was hit on {{direction}} {{symbol}} at {{exitPrice}}.',
      bodyHtml: null,
      variables: ['direction', 'symbol', 'exitPrice'],
    },
    PUSH: {
      subject: 'Take profit hit',
      bodyText: '{{symbol}} hit take profit at {{exitPrice}}.',
      bodyHtml: null,
      variables: ['symbol', 'exitPrice'],
    },
    EMAIL: {
      subject: 'Take profit hit: {{symbol}}',
      bodyText: 'Take profit was hit.\n\nSymbol: {{symbol}}\nDirection: {{direction}}\nExit price: {{exitPrice}}\nRealized P/L: {{realizedProfit}}',
      bodyHtml:
        '<div style="font-family: Arial, sans-serif; max-width: 560px;"><h2>Take profit hit</h2><p><strong>Symbol:</strong> {{symbol}}</p><p><strong>Direction:</strong> {{direction}}</p><p><strong>Exit price:</strong> {{exitPrice}}</p><p><strong>Realized P/L:</strong> {{realizedProfit}}</p></div>',
      variables: ['symbol', 'direction', 'exitPrice', 'realizedProfit'],
    },
  },
});

export default TAKE_PROFIT_HIT_TEMPLATE;