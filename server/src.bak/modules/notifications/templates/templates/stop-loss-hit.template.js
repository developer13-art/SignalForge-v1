/**
 * Stop Loss Hit Template
 *
 * @module server/modules/notifications/templates/templates/stop-loss-hit
 */

export const STOP_LOSS_HIT_TEMPLATE = Object.freeze({
  templateKey: 'STOP_LOSS_HIT',
  channels: {
    IN_APP: {
      subject: 'Stop loss hit: {{symbol}}',
      bodyText: 'Stop loss was hit on {{direction}} {{symbol}} at {{exitPrice}}.',
      bodyHtml: null,
      variables: ['direction', 'symbol', 'exitPrice'],
    },
    PUSH: {
      subject: 'Stop loss hit',
      bodyText: '{{symbol}} hit stop loss at {{exitPrice}}.',
      bodyHtml: null,
      variables: ['symbol', 'exitPrice'],
    },
    EMAIL: {
      subject: 'Stop loss hit: {{symbol}}',
      bodyText: 'Stop loss was hit.\n\nSymbol: {{symbol}}\nDirection: {{direction}}\nExit price: {{exitPrice}}\nRealized P/L: {{realizedProfit}}',
      bodyHtml:
        '<div style="font-family: Arial, sans-serif; max-width: 560px;"><h2>Stop loss hit</h2><p><strong>Symbol:</strong> {{symbol}}</p><p><strong>Direction:</strong> {{direction}}</p><p><strong>Exit price:</strong> {{exitPrice}}</p><p><strong>Realized P/L:</strong> {{realizedProfit}}</p></div>',
      variables: ['symbol', 'direction', 'exitPrice', 'realizedProfit'],
    },
  },
});

export default STOP_LOSS_HIT_TEMPLATE;