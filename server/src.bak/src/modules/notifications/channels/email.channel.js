/**
 * Email Notification Channel
 *
 * Delivers notifications via email using the SMTP sender service.
 *
 * @module server/modules/notifications/channels/email.channel
 */
const { AppError } = require('../../../lib/errors/app-error');
const { ERROR_CODES } = require('../../../lib/errors/error-codes');
const { logger } = require('../../../lib/logger');
const { config } = require('../../../config');
const { smtpSenderService } = require('../../signal-sources/email/smtp-sender.service');
const { templateRendererService } = require('../templates/template-renderer.service');
const emailChannel = {
  name: 'EMAIL',

  async isAvailable({ user }) {
    if (!user || !user.email) {
      return false;
    }
    return Boolean(config.mail && config.mail.host);
  },

  async send({ notification, user, templateData }) {
    if (!user || !user.email) {
      throw new AppError('User email is required for EMAIL channel', ERROR_CODES.NOTIFICATION_CHANNEL_UNAVAILABLE, 400);
    }

    let html = null;
    let text = notification.body || notification.title;

    if (notification.template_key) {
      try {
        const rendered = await templateRendererService.renderTemplate({
          templateKey: notification.template_key,
          channel: 'EMAIL',
          data: templateData || {},
        });

        html = rendered.html || null;
        text = rendered.text || text;
      } catch (err) {
        logger.warn({ err, templateKey: notification.template_key }, 'Failed to render email template; falling back to plain text');
      }
    } else if (notification.body) {
      html = `<div style="font-family: Arial, sans-serif;"><h2>${notification.title}</h2><p>${notification.body}</p></div>`;
    }

    const result = await smtpSenderService.sendEmail({
      to: user.email,
      subject: notification.title,
      text,
      html,
      replyTo: notification.action_url ? undefined : undefined,
    });

    return {
      delivered: true,
      providerReference: result.messageId || null,
    };
  },
};
module.exports = emailChannel;
module.exports.emailChannel = emailChannel;
