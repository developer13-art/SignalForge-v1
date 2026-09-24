/**
 * Password Reset Template
 *
 * @module server/modules/notifications/templates/templates/password-reset
 */

export const PASSWORD_RESET_TEMPLATE = Object.freeze({
  templateKey: 'PASSWORD_RESET',
  channels: {
    EMAIL: {
      subject: 'Reset your SignalForge password',
      bodyText:
        'Hello {{firstName}},\n\nYour password reset code is: {{code}}\n\nThis code expires in {{expiresInMinutes}} minutes. If you did not request this, please ignore this email and change your password immediately.',
      bodyHtml:
        '<div style="font-family: Arial, sans-serif; max-width: 560px;"><h2>Reset your password</h2><p>Hello {{firstName}},</p><p>Your reset code is:</p><p style="font-size: 28px; letter-spacing: 4px; font-weight: bold;">{{code}}</p><p>This code expires in {{expiresInMinutes}} minutes.</p><p>If you did not request this, please ignore this email and change your password immediately.</p></div>',
      variables: ['firstName', 'code', 'expiresInMinutes'],
    },
  },
});

export default PASSWORD_RESET_TEMPLATE;