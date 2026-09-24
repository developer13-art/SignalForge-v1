/**
 * Trade Closed Template
 *
 * @module server/modules/notifications/templates/templates/trade-closed
 */

export const TRADE_CLOSED_TEMPLATE = Object.freeze({
  templateKey: 'TRADE_CLOSED',
  channels: {
    IN_APP: {
      subject: 'Trade closed: {{direction}} {{symbol}}',
      bodyText: 'Position closed: {{direction}} {{symbol}}. Realized profit: {{realizedProfit}}.',
      bodyHtml: null,
      variables: ['direction', 'symbol', 'realizedProfit'],
    },
    PUSH: {
      subject: 'Trade closed',
      bodyText: '{{direction}} {{symbol}} closed. P/L: {{realizedProfit}}.',
      bodyHtml: null,
      variables: ['direction', 'symbol', 'realizedProfit'],
    },
    EMAIL: {
      subject: 'Trade closed: {{direction}} {{symbol}}',
      bodyText:
        'A position has been closed.\n\nDirection: {{direction}}\nSymbol: {{symbol}}\nEntry price: {{entryPrice}}\nExit price: {{exitPrice}}\nRealized P/L: {{realizedProfit}}',
      bodyHtml:
        '<div style="font-family: Arial, sans-serif; max-width: 560px;"><h2>Trade closed</h2><p><strong>Direction:</strong> {{direction}}</p><p><strong>Symbol:</strong> {{symbol}}</p><p><strong>Entry price:</strong> {{entryPrice}}</p><p><strong>Exit price:</strong> {{exitPrice}}</p><p><strong>Realized P/L:</strong> {{realizedProfit}}</p></div>',
      variables: ['direction', 'symbol', 'entryPrice', 'exitPrice', 'realizedProfit'],
    },
  },
});

export default TRADE_CLOSED_TEMPLATE;