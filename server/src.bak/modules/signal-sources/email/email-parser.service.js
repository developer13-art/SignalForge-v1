/**
 * Email Parser Service
 *
 * Parses raw RFC 822 email messages into normalized envelopes, extracts
 * the sender, subject, and plain-text/HTML body, dispatches attachment
 * handling, and publishes MESSAGE_RECEIVED for the signal pipeline.
 *
 * @module server/modules/signal-sources/email/email-parser.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { logger } from '../../../lib/logger';
import { SOURCE_TYPES } from '@signalforge/shared/constants/source-types';
import { EVENT_TYPES } from '@signalforge/shared/constants/event-types';
import { buildSourceMessageKey } from '@signalforge/shared/utils/idempotency.util';
import { buildMessageFingerprint } from '@signalforge/shared/utils/fingerprint.util';
import { publishEvent } from '../../../events/event-publisher';
import { messageRawStoreService } from '../messages/message-raw-store.service';
import { handleEmailAttachments } from './email-attachment.service';

function stripHtml(html) {
  if (!html || typeof html !== 'string') {
    return '';
  }
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

async function parseRawEmail(raw) {
  const mailparser = await import('mailparser').catch(() => null);

  if (!mailparser || !mailparser.simpleParser) {
    throw new AppError('Email parsing library is not available', ERROR_CODES.CONFIGURATION_MISSING, 500);
  }

  try {
    return await mailparser.simpleParser(raw);
  } catch (err) {
    logger.error({ err }, 'Failed to parse raw email');
    throw new AppError('Failed to parse email message', ERROR_CODES.EMAIL_PARSE_FAILED, 400);
  }
}

export async function handleEmailMessage({ userId, mailbox, raw, envelope, uid }) {
  if (!userId || !raw) {
    throw new AppError('userId and raw email are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const parsed = await parseRawEmail(raw);

  const from = parsed.from
    ? (parsed.from.value && parsed.from.value[0] ? parsed.from.value[0].address : null)
    : (envelope && envelope.from && envelope.from[0] ? envelope.from[0].address : null);

  const fromName = parsed.from
    ? (parsed.from.value && parsed.from.value[0] ? parsed.from.value[0].name : null)
    : null;

  const subject = parsed.subject || (envelope && envelope.subject) || '';

  const messageIdHeader = parsed.messageId || (envelope && envelope.messageId) || `imap-${uid || Date.now()}`;

  const timestamp = parsed.date
    ? new Date(parsed.date).toISOString()
    : new Date().toISOString();

  const text = parsed.text || stripHtml(parsed.html || '');

  const idempotencyKey = buildSourceMessageKey(
    SOURCE_TYPES.EMAIL,
    mailbox,
    String(messageIdHeader),
  );

  const fingerprint = buildMessageFingerprint({
    sourceType: SOURCE_TYPES.EMAIL,
    sourceId: mailbox,
    externalMessageId: String(messageIdHeader),
    timestamp,
  });

  const envelopeData = {
    sourceType: SOURCE_TYPES.EMAIL,
    sourceId: mailbox,
    channelId: mailbox,
    externalMessageId: String(messageIdHeader),
    userId,
    senderId: from || null,
    senderName: fromName || null,
    subject,
    text,
    html: parsed.html || null,
    replyTo: parsed.replyTo
      ? (parsed.replyTo.value && parsed.replyTo.value[0] ? parsed.replyTo.value[0].address : null)
      : null,
    timestamp,
    idempotencyKey,
    fingerprint,
    rawPayload: {
      messageId: messageIdHeader,
      from,
      to: parsed.to ? parsed.to.text : null,
      cc: parsed.cc ? parsed.cc.text : null,
      bcc: parsed.bcc ? parsed.bcc.text : null,
      date: parsed.date,
      headers: parsed.headerLines ? parsed.headerLines.map((h) => ({ key: h.key, line: h.line })) : null,
    },
  };

  if (parsed.attachments && parsed.attachments.length > 0) {
    try {
      const attachmentsResult = await handleEmailAttachments({
        userId,
        mailbox,
        messageId: messageIdHeader,
        attachments: parsed.attachments,
      });
      envelopeData.attachments = attachmentsResult.attachments;
    } catch (err) {
      logger.warn({ err, userId, mailbox }, 'Failed to handle email attachments');
      envelopeData.attachments = [];
    }
  }

  const stored = await messageRawStoreService.persistIncoming({
    userId,
    envelope: envelopeData,
  });

  if (stored && stored.duplicate) {
    logger.debug({ userId, idempotencyKey }, 'Duplicate email message skipped');
    return { handled: false, duplicate: true, messageId: envelopeData.externalMessageId };
  }

  await publishEvent({
    eventType: EVENT_TYPES.MESSAGE_RECEIVED,
    source: 'email.parser',
    actorId: userId,
    payload: {
      ...envelopeData,
      storedMessageId: stored ? stored.id : null,
    },
  });

  logger.info(
    { userId, mailbox, messageId: envelopeData.externalMessageId, from },
    'Email message ingested',
  );

  return {
    handled: true,
    storedMessageId: stored ? stored.id : null,
    messageId: envelopeData.externalMessageId,
  };
}

export const emailParserService = {
  handleEmailMessage,
  stripHtml,
};