/**
 * Welcome Template
 *
 * @module server/modules/notifications/templates/templates/welcome
 */

export const WELCOME_TEMPLATE = Object.freeze({
  templateKey: 'WELCOME',
  channels: {
    EMAIL: {
      subject: 'Welcome to SignalForge, {{firstName}}',
      bodyText:
        'Hello {{firstName}},\n\nWelcome to SignalForge. Your account is ready.\n\nYou can now connect signal sources and broker accounts to begin automating your trading workflow.\n\nFor support, reply to this email or visit our help center.',
      bodyHtml:
        '<div style="font-family: Arial, sans-serif; max-width: 560px;"><h2>Welcome to SignalForge</h2><p>Hello {{firstName}},</p><p>Your account is ready. You can now connect signal sources and broker accounts to begin automating your trading workflow.</p><p>For support, reply to this email or visit our help center.</p></div>',
      variables: ['firstName'],
    },
    IN_APP: {
      subject: 'Welcome to SignalForge',
      bodyText: 'Your account is ready. Connect a signal source to get started.',
      bodyHtml: null,
      variables: ['firstName'],
    },
  },
});

export default WELCOME_TEMPLATE;