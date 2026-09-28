/**
 * Security Alert Template
 *
 * @module server/modules/notifications/templates/templates/security-alert
 */

export const SECURITY_ALERT_TEMPLATE = Object.freeze({
  templateKey: 'SECURITY_ALERT',
  channels: {
    IN_APP: {
      subject: 'Security alert',
      bodyText: '{{alertMessage}}',
      bodyHtml: null,
      variables: ['alertMessage'],
    },
    EMAIL: {
      subject: 'Security alert for your SignalForge account',
      bodyText:
        'Hello {{firstName}},\n\n{{alertMessage}}\n\nIf this was not you, please secure your account immediately by changing your password and enabling two-factor authentication.',
      bodyHtml:
        '<div style="font-family: Arial, sans-serif; max-width: 560px;"><h2>Security alert</h2><p>Hello {{firstName}},</p><p>{{alertMessage}}</p><p>If this was not you, please secure your account immediately by changing your password and enabling two-factor authentication.</p></div>',
      variables: ['firstName', 'alertMessage'],
    },
    PUSH: {
      subject: 'Security alert',
      bodyText: '{{alertMessage}}',
      bodyHtml: null,
      variables: ['alertMessage'],
    },
  },
});

export default SECURITY_ALERT_TEMPLATE;