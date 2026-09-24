/**
 * Email Verification Template
 *
 * @module server/modules/notifications/templates/templates/email-verification
 */

export const EMAIL_VERIFICATION_TEMPLATE = Object.freeze({
  templateKey: 'EMAIL_VERIFICATION',
  channels: {
    EMAIL: {
      subject: 'Verify your SignalForge email',
      bodyText:
        'Hello {{firstName}},\n\nYour email verification code is: {{code}}\n\nThis code expires in {{expiresInMinutes}} minutes. If you did not request this, please ignore this email.',
      bodyHtml:
        '<div style="font-family: Arial, sans-serif; max-width: 560px;"><h2>Verify your email</h2><p>Hello {{firstName}},</p><p>Your verification code is:</p><p style="font-size: 28px; letter-spacing: 4px; font-weight: bold;">{{code}}</p><p>This code expires in {{expiresInMinutes}} minutes.</p></div>',
      variables: ['firstName', 'code', 'expiresInMinutes'],
    },
  },
});

export default EMAIL_VERIFICATION_TEMPLATE;