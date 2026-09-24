/**
 * SMTP Sender Service
 *
 * Provides outbound email sending using the configured SMTP provider.
 * Used for verification emails, notification emails, and support
 * replies. Enforces header safety and HTML/plain-text dual bodies.
 *
 * @module server/modules/signal-sources/email/smtp-sender.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { logger } from '../../../lib/logger';
import { config } from '../../../config';

function assertSmtpConfig() {
  if (!config.mail || !config.mail.host) {
    throw new AppError('SMTP is not configured', ERROR_CODES.CONFIGURATION_MISSING, 500);
  }
}

function sanitizeHeaderValue(value) {
  if (value === undefined || value === null) {
    return '';
  }
  return String(value).replace(/[\r\n]+/g, ' ').trim();
}

function buildFromAddress() {
  const address = config.mail.fromAddress || 'no-reply@signalforge.ai';
  const name = config.mail.fromName || 'SignalForge';
  return `${name} <${address}>`;
}

export async function sendEmail({ to, subject, text, html, replyTo, cc, bcc }) {
  assertSmtpConfig();

  if (!to) {
    throw new AppError('Email recipient is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (!subject) {
    throw new AppError('Email subject is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (!text && !html) {
    throw new AppError('Email must have a text or HTML body', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const nodemailer = await import('nodemailer').catch(() => null);

  if (!nodemailer || !nodemailer.createTransport) {
    throw new AppError('Email transport library is not available', ERROR_CODES.CONFIGURATION_MISSING, 500);
  }

  const transporter = nodemailer.createTransport({
    host: config.mail.host,
    port: config.mail.port,
    secure: config.mail.secure,
    auth: config.mail.user
      ? {
          user: config.mail.user,
          pass: config.mail.password,
        }
      : undefined,
    tls: {
      rejectUnauthorized: config.mail.tlsRejectUnauthorized !== false,
    },
  });

  const message = {
    from: buildFromAddress(),
    to: Array.isArray(to) ? to.join(', ') : to,
    subject: sanitizeHeaderValue(subject),
    text: text || undefined,
    html: html || undefined,
    replyTo: replyTo ? sanitizeHeaderValue(replyTo) : undefined,
    cc: cc ? (Array.isArray(cc) ? cc.join(', ') : cc) : undefined,
    bcc: bcc ? (Array.isArray(bcc) ? bcc.join(', ') : bcc) : undefined,
  };

  try {
    const info = await transporter.sendMail(message);
    logger.info({ to, subject, messageId: info.messageId }, 'Email sent');
    return { sent: true, messageId: info.messageId, accepted: info.accepted, rejected: info.rejected };
  } catch (err) {
    logger.error({ err, to, subject }, 'Failed to send email');
    throw new AppError('Failed to send email', ERROR_CODES.EMAIL_SEND_FAILED, 502);
  } finally {
    try {
      transporter.close();
    } catch (err) {
      logger.warn({ err }, 'Error closing email transporter');
    }
  }
}

export async function sendVerificationEmail({ to, code, expiresInMinutes = 15 }) {
  const subject = 'Verify your SignalForge account';
  const text = `Your verification code is ${code}. It expires in ${expiresInMinutes} minutes.`;
  const html = `
    <div style="font-family: Arial, sans-serif;">
      <h2>Verify your SignalForge account</h2>
      <p>Your verification code is:</p>
      <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px;">${code}</p>
      <p>This code expires in ${expiresInMinutes} minutes.</p>
      <p>If you did not request this, please ignore this email.</p>
    </div>
  `;
  return sendEmail({ to, subject, text, html });
}

export async function sendPasswordResetEmail({ to, code, expiresInMinutes = 15 }) {
  const subject = 'Reset your SignalForge password';
  const text = `Your password reset code is ${code}. It expires in ${expiresInMinutes} minutes.`;
  const html = `
    <div style="font-family: Arial, sans-serif;">
      <h2>Reset your SignalForge password</h2>
      <p>Your reset code is:</p>
      <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px;">${code}</p>
      <p>This code expires in ${expiresInMinutes} minutes.</p>
      <p>If you did not request this, please ignore this email.</p>
    </div>
  `;
  return sendEmail({ to, subject, text, html });
}

export async function sendSystemEmail({ to, subject, text, html, replyTo }) {
  return sendEmail({ to, subject, text, html, replyTo });
}

export const smtpSenderService = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendSystemEmail,
};