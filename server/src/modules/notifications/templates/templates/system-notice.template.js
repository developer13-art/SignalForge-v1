/**
 * System Notice Template
 *
 * @module server/modules/notifications/templates/templates/system-notice
 */

export const SYSTEM_NOTICE_TEMPLATE = Object.freeze({
  templateKey: 'SYSTEM_NOTICE',
  channels: {
    IN_APP: {
      subject: '{{title}}',
      bodyText: '{{message}}',
      bodyHtml: null,
      variables: ['title', 'message'],
    },
    EMAIL: {
      subject: '{{title}}',
      bodyText: 'Hello,\n\n{{message}}\n\nThank you for using SignalForge.',
      bodyHtml:
        '<div style="font-family: Arial, sans-serif; max-width: 560px;"><h2>{{title}}</h2><p>{{message}}</p><p>Thank you for using SignalForge.</p></div>',
      variables: ['title', 'message'],
    },
  },
});

export default SYSTEM_NOTICE_TEMPLATE;