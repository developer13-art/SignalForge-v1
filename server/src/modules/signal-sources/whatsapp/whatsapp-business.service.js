/**
 * WhatsApp Business API Service
 *
 * Provides support for the older WhatsApp Business API (on-premise)
 * alongside the Cloud API. Handles token-based session management
 * using a per-user stored token, and exposes the same interface as
 * the Cloud service so the listener can use either backend.
 *
 * @module server/modules/signal-sources/whatsapp/whatsapp-business.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { logger } from '../../../lib/logger';
import { config } from '../../../config';
import { encryptPacked, decryptPacked } from '@signalforge/shared/utils/crypto.util';
import { nowIso } from '@signalforge/shared/utils/date.util';
import { db } from '../../../database';
import { emitWhatsAppSessionConnected, emitWhatsAppSessionRevoked } from './whatsapp.events';

function getEncryptionKey() {
  const key = config.whatsapp?.sessionEncryptionKey || config.security?.encryptionKey;
  if (!key) {
    throw new AppError('WhatsApp session encryption key is not configured', ERROR_CODES.CONFIGURATION_MISSING, 500);
  }
  return key;
}

function getBusinessBaseUrl() {
  const base = config.whatsapp?.businessBaseUrl;
  if (!base) {
    throw new AppError('WhatsApp Business API base URL is not configured', ERROR_CODES.CONFIGURATION_MISSING, 500);
  }
  return base;
}

export async function subscribeBusiness({ userId, phoneNumberId, accessToken }) {
  if (!userId || !phoneNumberId || !accessToken) {
    throw new AppError(
      'userId, phoneNumberId, and accessToken are required',
      ERROR_CODES.VALIDATION_FAILED,
      400,
    );
  }

  const encryptionKey = getEncryptionKey();
  const tokenCipher = encryptPacked(accessToken, encryptionKey);

  await db.query(
    `INSERT INTO whatsapp_connections
       (user_id, phone_number_id, business_account_id, access_token_cipher,
        provider, created_at, updated_at)
     VALUES ($1, $2, NULL, $3, 'BUSINESS', $4, $4)
     ON CONFLICT (user_id) DO UPDATE
       SET phone_number_id = EXCLUDED.phone_number_id,
           access_token_cipher = EXCLUDED.access_token_cipher,
           provider = 'BUSINESS',
           updated_at = EXCLUDED.updated_at`,
    [userId, phoneNumberId, tokenCipher, nowIso()],
  );

  await emitWhatsAppSessionConnected({
    userId,
    phoneNumberId,
    businessAccountId: null,
  }).catch((err) => logger.warn({ err }, 'Failed to emit WhatsApp Business connected event'));

  logger.info({ userId, phoneNumberId }, 'WhatsApp Business API subscribed');

  return { subscribed: true, phoneNumberId, provider: 'BUSINESS' };
}

export async function unsubscribeBusiness({ userId, reason }) {
  if (!userId) {
    throw new AppError('userId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  await db.query(`DELETE FROM whatsapp_connections WHERE user_id = $1 AND provider = 'BUSINESS'`, [userId]);

  await emitWhatsAppSessionRevoked({ userId, reason }).catch((err) => logger.warn({ err }, 'Failed to emit WhatsApp Business revoked event'));

  return { revoked: true };
}

export async function getBusinessAccessToken({ userId }) {
  if (!userId) {
    throw new AppError('userId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const { rows } = await db.query(
    `SELECT id, phone_number_id, access_token_cipher
       FROM whatsapp_connections
      WHERE user_id = $1 AND provider = 'BUSINESS'
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
    logger.error({ err, userId }, 'Failed to decrypt WhatsApp Business access token');
    throw new AppError('WhatsApp Business access token could not be decrypted', ERROR_CODES.WHATSAPP_DECRYPT_FAILED, 500);
  }

  return {
    connectionId: row.id,
    phoneNumberId: row.phone_number_id,
    accessToken,
    provider: 'BUSINESS',
  };
}

export async function sendBusinessTextMessage({ userId, to, text }) {
  if (!userId || !to || !text) {
    throw new AppError('userId, to, and text are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const connection = await getBusinessAccessToken({ userId });
  if (!connection) {
    throw new AppError('WhatsApp Business connection not found', ERROR_CODES.WHATSAPP_CONNECTION_NOT_FOUND, 404);
  }

  const base = getBusinessBaseUrl();

  try {
    const response = await fetch(`${base}/${connection.phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${connection.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: text },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      throw new Error(`WhatsApp Business send failed: ${response.status} ${errorBody}`);
    }

    const result = await response.json();
    logger.info({ userId, to }, 'WhatsApp Business message sent');
    return { sent: true, messageId: result.messages?.[0]?.id || null };
  } catch (err) {
    logger.error({ err, userId, to }, 'Failed to send WhatsApp Business message');
    throw new AppError('Failed to send WhatsApp Business message', ERROR_CODES.WHATSAPP_SEND_FAILED, 502);
  }
}

export async function healthCheckBusiness({ userId }) {
  if (!userId) {
    throw new AppError('userId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const connection = await getBusinessAccessToken({ userId });
  if (!connection) {
    return { healthy: false, reason: 'NO_CONNECTION' };
  }

  const base = getBusinessBaseUrl();

  try {
    const response = await fetch(`${base}/${connection.phoneNumberId}`, {
      headers: { Authorization: `Bearer ${connection.accessToken}` },
    });

    if (!response.ok) {
      return { healthy: false, reason: `HTTP_${response.status}` };
    }

    return { healthy: true };
  } catch (err) {
    return { healthy: false, reason: err.message };
  }
}

export const whatsappBusinessService = {
  subscribeBusiness,
  unsubscribeBusiness,
  getBusinessAccessToken,
  sendBusinessTextMessage,
  healthCheckBusiness,
};