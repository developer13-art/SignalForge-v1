/**
 * Signal Detected Template
 *
 * @module server/modules/notifications/templates/templates/signal-detected
 */

export const SIGNAL_DETECTED_TEMPLATE = Object.freeze({
  templateKey: 'SIGNAL_DETECTED',
  channels: {
    IN_APP: {
      subject: 'New signal: {{direction}} {{symbol}}',
      bodyText: 'A new signal has been detected from {{providerName}}: {{direction}} {{symbol}} with confidence {{confidence}}%.',
      bodyHtml: null,
      variables: ['direction', 'symbol', 'providerName', 'confidence'],
    },
    PUSH: {
      subject: '{{direction}} {{symbol}}',
      bodyText: 'New signal from {{providerName}}. Confidence: {{confidence}}%.',
      bodyHtml: null,
      variables: ['direction', 'symbol', 'providerName', 'confidence'],
    },
    EMAIL: {
      subject: 'New signal detected: {{direction}} {{symbol}}',
      bodyText:
        'A new signal has been detected.\n\nProvider: {{providerName}}\nDirection: {{direction}}\nSymbol: {{symbol}}\nConfidence: {{confidence}}%\n\nLog in to view the details.',
      bodyHtml:
        '<div style="font-family: Arial, sans-serif; max-width: 560px;"><h2>New signal detected</h2><p><strong>Provider:</strong> {{providerName}}</p><p><strong>Direction:</strong> {{direction}}</p><p><strong>Symbol:</strong> {{symbol}}</p><p><strong>Confidence:</strong> {{confidence}}%</p></div>',
      variables: ['direction', 'symbol', 'providerName', 'confidence'],
    },
  },
});

export default SIGNAL_DETECTED_TEMPLATE;