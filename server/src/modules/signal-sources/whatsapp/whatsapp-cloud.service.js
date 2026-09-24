/**
 * WhatsApp Cloud API Service
 *
 * Manages subscription to the WhatsApp Cloud API, token storage, and
 * outbound calls to the Meta Graph endpoint. Handles webhook
 * verification handshakes and normalizes inbound Cloud API messages
 * before dispatch to the listener.
 *
 * @module server/modules/signal-sources/whatsapp/whatsapp-cloud.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { logger } from '../../../lib/logger';
import { config } from '../../../config';
import { encryptPacked, decryptPacked } from '@signalforge/shared/utils/crypto.util';
import { nowIso } from '@signalforge/shared/utils/date.util';
import { db } from '../../../database';
import {
  emitWhatsAppSessionConnected,
  emitWhatsAppSessionRevoked,
} from './whatsapp.events';

const GRAPH_BASE = 'https://graph.facebook.com/v20.0';

function getEncryptionKey() {
  const key = config.whatsapp?.sessionEncryptionKey || config.security?.encryptionKey;
  if (!key) {
    throw new AppError('WhatsApp session encryption key is not configured', ERROR_CODES.CONFIGURATION_MISSING, 500);
  }
  return key;
}

function getAppSecret() {
  const secret = config.whatsapp?.appSecret;
  if (!secret) {
    throw new AppError('WhatsApp app secret is not configured', ERROR_CODES.CONFIGURATION_MISSING, 500);
  }
  return secret;
}

function getVerifyToken() {
  const token = config.whatsapp?.verifyToken;
  if (!token) {
    throw new AppError('WhatsApp verify token is not configured', ERROR_CODES.CONFIGURATION_MISSING, 500);
  }
  return token;
}

export function verifyWebhookChallenge({ mode, token, challenge }) {
  if (mode !== 'subscribe') {
    throw new AppError('Unsupported WhatsApp webhook mode', ERROR_CODES.WHATSAPP_WEBHOOK_INVALID, 400);
  }

  const expected = getVerifyToken();

  if (token !== expected) {
    throw new AppError('WhatsApp webhook verify token does not match', ERROR_CODES.WHATSAPP_WEBHOOK_INVALID, 401);
  }

  return { challenge };
}

export async function subscribe({ userId, phoneNumberId, businessAccountId, accessToken }) {
  if (!userId || !phoneNumberId || !businessAccountId || !accessToken) {
    throw new AppError(
      'userId, phoneNumberId, businessAccountId, and accessToken are required',
      ERROR_CODES.VALIDATION_FAILED,
      400,
    );
  }

  const encryptionKey = getEncryptionKey();
  const accessTokenCipher = encryptPacked(accessToken, encryptionKey);

  let profile;
  try {
    const response = await fetch(`${GRAPH_BASE}/${phoneNumberId}?fields=display_phone_number,verified_name`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`Graph API ${response.status}: ${body}`);
    }
    profile = await response.json();
  } catch (err) {
    logger.error({ err, userId, phoneNumberId }, 'Failed to fetch WhatsApp phone number profile');
    throw new AppError('Failed to fetch WhatsApp phone number profile', ERROR_CODES.WHATSAPP_CLOUD_FAILED, 502);
  }

  await db.query(
    `INSERT INTO whatsapp_connections
       (user_id, phone_number_id, business_account_id, access_token_cipher,
        display_phone_number, verified_name, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
     ON CONFLICT (user_id) DO UPDATE
       SET phone_number_id = EXCLUDED.phone_number_id,
           business_account_id = EXCLUDED.business_account_id,
           access_token_cipher = EXCLUDED.access_token_cipher,
           display_phone_number = EXCLUDED.display_phone_number,
           verified_name = EXCLUDED.verified_name,
           updated_at = EXCLUDED.updated_at`,
    [
      userId,
      phoneNumberId,
      businessAccountId,
      accessTokenCipher,
      profile.display_phone_number || null,
      profile.verified_name || null,
      nowIso(),
    ],
  );

  await emitWhatsAppSessionConnected({
    userId,
    phoneNumberId,
    businessAccountId,
  }).catch((err) => logger.warn({ err }, 'Failed to emit WhatsApp session connected event'));

  logger.info({ userId, phoneNumberId }, 'WhatsApp Cloud API subscribed');

  return {
    subscribed: true,
    phoneNumberId,
    businessAccountId,
    displayPhoneNumber: profile.display_phone_number || null,
    verifiedName: profile.verified_name || null,
  };
}

export async function unsubscribe({ userId, reason }) {
  if (!userId) {
    throw new AppError('userId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  await db.query(`DELETE FROM whatsapp_connections WHERE user_id = $1`, [userId]);
  await db.query(`DELETE FROM whatsapp_groups WHERE user_id = $1`, [userId]);

  await emitWhatsAppSessionRevoked({ userId, reason }).catch((err) => logger.warn({ err }, 'Failed to emit WhatsApp session revoked event'));

  logger.info({ userId }, 'WhatsApp Cloud API unsubscribed');

  return { revoked: true };
}

export async function getAccessToken({ userId }) {
  if (!userId) {
    throw new AppError('userId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const { rows } = await db.query(
    `SELECT id, phone_number_id, business_account_id, access_token_cipher,
            display_phone_number, verified_name
       FROM whatsapp_connections
      WHERE user_id = $1
      LIMIT 1`,
    [userId],
  );

  const row = rows[0];
  if (!row) {
    return null;
  }

  const encryptionKey = getEncryptionKey();
  let accessToken;
  try {
    accessToken = decryptPacked(row.access_token_cipher, encryptionKey);
  } catch (err) {
    logger.error({ err, userId }, 'Failed to decrypt WhatsApp access token');
    throw new AppError('WhatsApp access token could not be decrypted', ERROR_CODES.WHATSAPP_DECRYPT_FAILED, 500);
  }

  return {
    connectionId: row.id,
    phoneNumberId: row.phone_number_id,
    businessAccountId: row.business_account_id,
    accessToken,
    displayPhoneNumber: row.display_phone_number,
    verifiedName: row.verified_name,
  };
}

export async function sendTextMessage({ userId, to, text }) {
  if (!userId || !to || !text) {
    throw new AppError('userId, to, and text are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const connection = await getAccessToken({ userId });
  if (!connection) {
    throw new AppError('WhatsApp connection not found for user', ERROR_CODES.WHATSAPP_CONNECTION_NOT_FOUND, 404);
  }

  const body = {
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: { body: text },
  };

  try {
    const response = await fetch(`${GRAPH_BASE}/${connection.phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${connection.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      throw new Error(`WhatsApp send failed: ${response.status} ${errorBody}`);
    }

    const result = await response.json();
    logger.info({ userId, to }, 'WhatsApp message sent');
    return { sent: true, messageId: result.messages?.[0]?.id || null };
  } catch (err) {
    logger.error({ err, userId, to }, 'Failed to send WhatsApp message');
    throw new AppError('Failed to send WhatsApp message', ERROR_CODES.WHATSAPP_SEND_FAILED, 502);
  }
}

export async function listConnectedUserIds() {
  const { rows } = await db.query(`SELECT user_id FROM whatsapp_connections`);
  return rows.map((row) => row.user_id);
}

export async function getConnectionMetadata({ userId }) {
  const connection = await getAccessToken({ userId });
  if (!connection) {
    return null;
  }
  return {
    connectionId: connection.connectionId,
    phoneNumberId: connection.phoneNumberId,
    businessAccountId: connection.businessAccountId,
    displayPhoneNumber: connection.displayPhoneNumber,
    verifiedName: connection.verifiedName,
  };
}

export const whatsappCloudService = {
  verifyWebhookChallenge,
  subscribe,
  unsubscribe,
  getAccessToken,
  getConnectionMetadata,
  sendTextMessage,
  listConnectedUserIds,
  getAppSecret,
};