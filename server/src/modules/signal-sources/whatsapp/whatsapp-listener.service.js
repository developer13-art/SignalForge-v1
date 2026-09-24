/**
 * WhatsApp Listener Service
 *
 * Handles inbound WhatsApp Cloud API webhook deliveries: signature
 * verification, payload decoding, and dispatch to the group and
 * message handlers. Also manages the per-user active listener state
 * so reconnect logic and health monitoring can track activity.
 *
 * @module server/modules/signal-sources/whatsapp/whatsapp-listener.service
 */

import crypto from 'node:crypto';
import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { logger } from '../../../lib/logger';
import { config } from '../../../config';
import { SOURCE_TYPES } from '@signalforge/shared/constants/source-types';
import { EVENT_TYPES } from '@signalforge/shared/constants/event-types';
import { buildSourceMessageKey } from '@signalforge/shared/utils/idempotency.util';
import { buildMessageFingerprint } from '@signalforge/shared/utils/fingerprint.util';
import { publishEvent } from '../../../events/event-publisher';
import { db } from '../../../database';
import { messageRawStoreService } from '../messages/message-raw-store.service';
import { whatsappCloudService } from './whatsapp-cloud.service';
import {
  emitWhatsAppWebhookReceived,
  emitWhatsAppWebhookRejected,
  emitWhatsAppHealthCheck,
} from './whatsapp.events';
import { handleWhatsAppMediaMessage } from './whatsapp-media.service';

const ACTIVE_LISTENERS = new Map();

const LISTENER_STATES = Object.freeze({
  IDLE: 'IDLE',
  RUNNING: 'RUNNING',
  STOPPED: 'STOPPED',
  FAILED: 'FAILED',
});

function setListenerState(userId, state, extra = {}) {
  const existing = ACTIVE_LISTENERS.get(userId) || {};
  ACTIVE_LISTENERS.set(userId, { ...existing, state, ...extra, updatedAt: Date.now() });
}

function getListenerState(userId) {
  return ACTIVE_LISTENERS.get(userId) || null;
}

function verifySignature({ rawBody, signatureHeader, appSecret }) {
  if (!signatureHeader) {
    return false;
  }

  const expected = crypto
    .createHmac('sha256', appSecret)
    .update(Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(String(rawBody), 'utf8'))
    .digest('hex');

  const provided = signatureHeader.startsWith('sha256=') ? signatureHeader.substring(7) : signatureHeader;

  if (provided.length !== expected.length) {
    return false;
  }

  return crypto.timingSafeEqual(Buffer.from(provided, 'hex'), Buffer.from(expected, 'hex'));
}

function normalizeTimestamp(rawTimestamp) {
  if (!rawTimestamp) {
    return new Date().toISOString();
  }
  const seconds = Number(rawTimestamp);
  if (!Number.isFinite(seconds)) {
    return new Date().toISOString();
  }
  return new Date(seconds * 1000).toISOString();
}

async function findUserForPhoneNumber(phoneNumberId) {
  const { rows } = await db.query(
    `SELECT user_id
       FROM whatsapp_connections
      WHERE phone_number_id = $1
      LIMIT 1`,
    [String(phoneNumberId)],
  );
  return rows[0]?.user_id || null;
}

export function verifyChallenge({ mode, token, challenge }) {
  return whatsappCloudService.verifyWebhookChallenge({ mode, token, challenge });
}

export async function handleWebhookDelivery({ rawBody, headers }) {
  const signatureHeader =
    headers['x-hub-signature-256'] ||
    headers['X-Hub-Signature-256'] ||
    null;

  const appSecret = config.whatsapp?.appSecret;

  if (!appSecret) {
    await emitWhatsAppWebhookRejected({ userId: null, reason: 'APP_SECRET_NOT_CONFIGURED' }).catch(() => {});
    throw new AppError('WhatsApp app secret is not configured', ERROR_CODES.CONFIGURATION_MISSING, 500);
  }

  if (!signatureHeader) {
    await emitWhatsAppWebhookRejected({ userId: null, reason: 'MISSING_SIGNATURE' }).catch(() => {});
    throw new AppError('WhatsApp webhook signature is missing', ERROR_CODES.WHATSAPP_WEBHOOK_INVALID, 400);
  }

  const valid = verifySignature({ rawBody, signatureHeader, appSecret });

  if (!valid) {
    await emitWhatsAppWebhookRejected({ userId: null, reason: 'INVALID_SIGNATURE' }).catch(() => {});
    throw new AppError('WhatsApp webhook signature is invalid', ERROR_CODES.WHATSAPP_WEBHOOK_INVALID, 401);
  }

  let payload;
  try {
    payload = JSON.parse(Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : String(rawBody));
  } catch (err) {
    await emitWhatsAppWebhookRejected({ userId: null, reason: 'INVALID_JSON' }).catch(() => {});
    throw new AppError('WhatsApp webhook payload is not valid JSON', ERROR_CODES.WHATSAPP_WEBHOOK_INVALID, 400);
  }

  if (payload.object !== 'whatsapp_business_account') {
    return { handled: false, ignored: true, reason: 'UNSUPPORTED_OBJECT' };
  }

  const results = [];

  for (const entry of Array.isArray(payload.entry) ? payload.entry : []) {
    for (const change of Array.isArray(entry.changes) ? entry.changes : []) {
      const value = change.value || {};
      const metadata = value.metadata || {};
      const phoneNumberId = metadata.phone_number_id;

      if (!phoneNumberId) {
        continue;
      }

      const userId = await findUserForPhoneNumber(phoneNumberId);

      if (!userId) {
        logger.debug({ phoneNumberId }, 'WhatsApp webhook received for unmonitored phone number');
        continue;
      }

      const messages = Array.isArray(value.messages) ? value.messages : [];

      for (const message of messages) {
        const result = await handleSingleMessage({ userId, phoneNumberId, message, value });
        results.push(result);

        if (result && result.handled) {
          await emitWhatsAppWebhookReceived({
            userId,
            messageId: message.id || null,
            groupId: message.from || null,
          }).catch((err) => logger.warn({ err }, 'Failed to emit WhatsApp webhook received event'));
        }
      }
    }
  }

  return { handled: true, processed: results.length, results };
}

async function handleSingleMessage({ userId, phoneNumberId, message, changeValue }) {
  if (!message || !message.id) {
    return { handled: false, reason: 'MISSING_MESSAGE_ID' };
  }

  const from = message.from ? String(message.from) : null;
  const timestamp = normalizeTimestamp(message.timestamp);
  const messageType = message.type || 'unknown';

  const idempotencyKey = buildSourceMessageKey(
    SOURCE_TYPES.WHATSAPP,
    phoneNumberId,
    String(message.id),
  );

  const fingerprint = buildMessageFingerprint({
    sourceType: SOURCE_TYPES.WHATSAPP,
    sourceId: phoneNumberId,
    externalMessageId: String(message.id),
    timestamp,
  });

  const text = extractText(message);
  const isGroup = changeValue && Array.isArray(changeValue.contacts)
    ? Boolean(from && !changeValue.contacts.some((c) => c.wa_id === from))
    : false;

  const envelope = {
    sourceType: SOURCE_TYPES.WHATSAPP,
    sourceId: phoneNumberId,
    channelId: from,
    externalMessageId: String(message.id),
    userId,
    senderId: from,
    senderName: null,
    groupId: isGroup ? from : null,
    text: text || '',
    messageType,
    timestamp,
    idempotencyKey,
    fingerprint,
    rawPayload: message,
  };

  if (messageType !== 'text' && messageType !== 'interactive' && messageType !== 'button') {
    try {
      await handleWhatsAppMediaMessage({ userId, phoneNumberId, message, envelope });
    } catch (err) {
      logger.warn({ err, userId, messageId: message.id }, 'Failed to handle WhatsApp media message');
    }
  }

  const stored = await messageRawStoreService.persistIncoming({ userId, envelope });

  if (stored && stored.duplicate) {
    return { handled: false, duplicate: true, messageId: envelope.externalMessageId };
  }

  await publishEvent({
    eventType: EVENT_TYPES.MESSAGE_RECEIVED,
    source: 'whatsapp.listener',
    actorId: userId,
    payload: {
      ...envelope,
      storedMessageId: stored ? stored.id : null,
    },
  });

  logger.info(
    { userId, phoneNumberId, messageId: envelope.externalMessageId, messageType },
    'WhatsApp message ingested',
  );

  return { handled: true, storedMessageId: stored ? stored.id : null, messageId: envelope.externalMessageId };
}

function extractText(message) {
  if (message.text && typeof message.text.body === 'string') {
    return message.text.body;
  }

  if (message.button && typeof message.button.text === 'string') {
    return message.button.text;
  }

  if (message.interactive) {
    if (message.interactive.button_reply && message.interactive.button_reply.title) {
      return message.interactive.button_reply.title;
    }
    if (message.interactive.list_reply && message.interactive.list_reply.title) {
      return message.interactive.list_reply.title;
    }
  }

  return '';
}

export function start({ userId }) {
  if (!userId) {
    throw new AppError('userId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }
  setListenerState(userId, LISTENER_STATES.RUNNING, { startedAt: Date.now() });
  return { listening: true };
}

export function stop({ userId }) {
  if (!userId) {
    throw new AppError('userId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }
  setListenerState(userId, LISTENER_STATES.STOPPED, { stoppedAt: Date.now() });
  return { listening: false };
}

export async function runHealthCheck({ userId }) {
  const connection = await whatsappCloudService.getConnectionMetadata({ userId });

  const healthy = Boolean(connection);

  await emitWhatsAppHealthCheck({
    userId,
    healthy,
    details: connection ? { phoneNumberId: connection.phoneNumberId } : null,
  }).catch((err) => logger.warn({ err }, 'Failed to emit WhatsApp health check event'));

  return { healthy, connection };
}

export function listActive() {
  return Array.from(ACTIVE_LISTENERS.entries()).map(([userId, state]) => ({
    userId,
    state: state.state,
    startedAt: state.startedAt,
  }));
}

export const whatsappListenerService = {
  verifyChallenge,
  handleWebhookDelivery,
  start,
  stop,
  runHealthCheck,
  listActive,
  LISTENER_STATES,
};