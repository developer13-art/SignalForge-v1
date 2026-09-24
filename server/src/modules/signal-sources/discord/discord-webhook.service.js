/**
 * Discord Webhook Service
 *
 * Handles inbound Discord webhook deliveries (interactions endpoint)
 * including Ed25519 signature verification, event routing, and
 * dispatch to the message handler. Only authenticated deliveries are
 * accepted.
 *
 * @module server/modules/signal-sources/discord/discord-webhook.service
 */

import crypto from 'node:crypto';
import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { logger } from '../../../lib/logger';
import { config } from '../../../config';
import { db } from '../../../database';
import { handleDiscordMessage } from './discord-message-handler.service';
import {
  emitDiscordWebhookReceived,
  emitDiscordWebhookRejected,
} from './discord.events';

const SIGNATURE_HEADER = 'x-signature-ed25519';
const TIMESTAMP_HEADER = 'x-signature-timestamp';

function verifySignature({ signature, timestamp, body, publicKey }) {
  try {
    const message = Buffer.concat([
      Buffer.from(timestamp, 'utf8'),
      Buffer.isBuffer(body) ? body : Buffer.from(body, 'utf8'),
    ]);

    const signatureBuffer = Buffer.from(signature, 'hex');
    const publicKeyBuffer = Buffer.from(publicKey, 'hex');

    const keyObject = crypto.createPublicKey({
      key: Buffer.concat([
        Buffer.from('302a300506032b6570032100', 'hex'),
        publicKeyBuffer,
      ]),
      format: 'der',
      type: 'spki',
    });

    return crypto.verify(null, message, keyObject, signatureBuffer);
  } catch (err) {
    logger.warn({ err }, 'Discord signature verification failed');
    return false;
  }
}

async function findUserForGuild({ guildId, channelId }) {
  if (channelId) {
    const { rows } = await db.query(
      `SELECT user_id
         FROM discord_channels
        WHERE channel_id = $1 AND monitored = TRUE
        LIMIT 1`,
      [String(channelId)],
    );
    if (rows[0]) {
      return rows[0].user_id;
    }
  }

  if (guildId) {
    const { rows } = await db.query(
      `SELECT user_id
         FROM discord_guilds
        WHERE guild_id = $1
        LIMIT 1`,
      [String(guildId)],
    );
    if (rows[0]) {
      return rows[0].user_id;
    }
  }

  return null;
}

export async function verifyAndParseWebhook({ headers, rawBody }) {
  const signature = headers[SIGNATURE_HEADER] || headers[SIGNATURE_HEADER.toLowerCase()];
  const timestamp = headers[TIMESTAMP_HEADER] || headers[TIMESTAMP_HEADER.toLowerCase()];

  const publicKey = config.discord?.publicKey;

  if (!publicKey) {
    await emitDiscordWebhookRejected({ userId: null, reason: 'PUBLIC_KEY_NOT_CONFIGURED' }).catch(() => {});
    throw new AppError('Discord public key is not configured', ERROR_CODES.CONFIGURATION_MISSING, 500);
  }

  if (!signature || !timestamp) {
    await emitDiscordWebhookRejected({ userId: null, reason: 'MISSING_SIGNATURE' }).catch(() => {});
    throw new AppError('Discord webhook signature is missing', ERROR_CODES.DISCORD_WEBHOOK_INVALID, 400);
  }

  const valid = verifySignature({
    signature,
    timestamp,
    body: rawBody,
    publicKey,
  });

  if (!valid) {
    await emitDiscordWebhookRejected({ userId: null, reason: 'INVALID_SIGNATURE' }).catch(() => {});
    throw new AppError('Discord webhook signature is invalid', ERROR_CODES.DISCORD_WEBHOOK_INVALID, 401);
  }

  let payload;
  try {
    payload = JSON.parse(Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : String(rawBody));
  } catch (err) {
    throw new AppError('Discord webhook payload is not valid JSON', ERROR_CODES.DISCORD_WEBHOOK_INVALID, 400);
  }

  return payload;
}

export async function handleWebhookEvent({ payload }) {
  if (!payload || typeof payload !== 'object') {
    throw new AppError('Webhook payload is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const eventType = payload.t;

  if (!eventType) {
    throw new AppError('Webhook payload is missing event type', ERROR_CODES.DISCORD_WEBHOOK_INVALID, 400);
  }

  if (eventType === 'PING') {
    return { type: 1 };
  }

  if (eventType !== 'MESSAGE_CREATE' && eventType !== 'MESSAGE_UPDATE') {
    return { ignored: true, eventType };
  }

  const message = payload.d || {};
  const guildId = message.guild_id ? String(message.guild_id) : null;
  const channelId = message.channel_id ? String(message.channel_id) : null;
  const messageId = message.id ? String(message.id) : null;

  if (!channelId || !messageId) {
    throw new AppError('Discord webhook payload is missing channel or message id', ERROR_CODES.DISCORD_WEBHOOK_INVALID, 400);
  }

  const userId = await findUserForGuild({ guildId, channelId });

  if (!userId) {
    logger.debug({ guildId, channelId }, 'Discord webhook received for unmonitored channel');
    return { ignored: true, reason: 'UNMONITORED' };
  }

  const normalized = {
    guildId,
    channelId,
    messageId,
    authorId: message.author ? String(message.author.id) : null,
    authorName: message.author ? (message.author.username || null) : null,
    authorIsBot: message.author ? Boolean(message.author.bot) : false,
    content: message.content || '',
    attachments: Array.isArray(message.attachments) ? message.attachments : [],
    embeds: Array.isArray(message.embeds) ? message.embeds : [],
    referencedMessageId: message.referenced_message ? String(message.referenced_message.id) : null,
    editedTimestamp: eventType === 'MESSAGE_UPDATE' ? (message.edited_timestamp || new Date().toISOString()) : null,
    timestamp: message.timestamp || new Date().toISOString(),
    rawPayload: payload,
  };

  if (eventType === 'MESSAGE_UPDATE') {
    const { handleDiscordEditedMessage } = await import('./discord-message-handler.service');
    await handleDiscordEditedMessage({ userId, message: normalized });
  } else {
    await handleDiscordMessage({ userId, message: normalized });
  }

  await emitDiscordWebhookReceived({
    userId,
    guildId,
    channelId,
    messageId,
  }).catch((err) => logger.warn({ err }, 'Failed to emit Discord webhook received event'));

  logger.info({ userId, guildId, channelId, messageId, eventType }, 'Discord webhook processed');

  return { handled: true, eventType, userId, messageId };
}

export async function sendTestWebhook({ webhookUrl, content }) {
  if (!webhookUrl || !content) {
    throw new AppError('webhookUrl and content are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new AppError(
      `Discord webhook send failed: ${response.status} ${body}`,
      ERROR_CODES.DISCORD_WEBHOOK_SEND_FAILED,
      502,
    );
  }

  return { sent: true };
}

export const discordWebhookService = {
  verifyAndParseWebhook,
  handleWebhookEvent,
  sendTestWebhook,
  SIGNATURE_HEADER,
  TIMESTAMP_HEADER,
};