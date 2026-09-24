/**
 * Trade Opened Template
 *
 * @module server/modules/notifications/templates/templates/trade-opened
 */

export const TRADE_OPENED_TEMPLATE = Object.freeze({
  templateKey: 'TRADE_OPENED',
  channels: {
    IN_APP: {
      subject: 'Trade opened: {{direction}} {{symbol}}',
      bodyText: 'Position opened: {{direction}} {{symbol}} at {{entryPrice}} with volume {{volume}}.',
      bodyHtml: null,
      variables: ['direction', 'symbol', 'entryPrice', 'volume'],
    },
    PUSH: {
      subject: 'Trade opened',
      bodyText: '{{direction}} {{symbol}} opened at {{entryPrice}}.',
      bodyHtml: null,
      variables: ['direction', 'symbol', 'entryPrice'],
    },
    EMAIL: {
      subject: 'Trade opened: {{direction}} {{symbol}}',
      bodyText:
        'A new position has been opened.\n\nDirection: {{direction}}\nSymbol: {{symbol}}\nEntry price: {{entryPrice}}\nStop loss: {{stopLoss}}\nTake profit: {{takeProfit}}\nVolume: {{volume}}',
      bodyHtml:
        '<div style="font-family: Arial, sans-serif; max-width: 560px;"><h2>Trade opened</h2><p><strong>Direction:</strong> {{direction}}</p><p><strong>Symbol:</strong> {{symbol}}</p><p><strong>Entry price:</strong> {{entryPrice}}</p><p><strong>Stop loss:</strong> {{stopLoss}}</p><p><strong>Take profit:</strong> {{takeProfit}}</p><p><strong>Volume:</strong> {{volume}}</p></div>',
      variables: ['direction', 'symbol', 'entryPrice', 'stopLoss', 'takeProfit', 'volume'],
    },
  },
});

export default TRADE_OPENED_TEMPLATE;