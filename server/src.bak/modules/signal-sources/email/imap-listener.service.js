/**
 * IMAP Listener Service
 *
 * Maintains per-user IMAP connections and listens for new messages in
 * a monitored mailbox. New messages are normalized and dispatched to
 * the email parser, then persisted via the raw message store.
 *
 * @module server/modules/signal-sources/email/imap-listener.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { logger } from '../../../lib/logger';
import { config } from '../../../config';
import { nowIso } from '@signalforge/shared/utils/date.util';
import { db } from '../../../database';
import { encryptPacked, decryptPacked } from '@signalforge/shared/utils/crypto.util';
import { handleEmailMessage } from './email-parser.service';
import {
  emitEmailSessionConnected,
  emitEmailSessionRevoked,
} from './email.events';

const ACTIVE_LISTENERS = new Map();

function getEncryptionKey() {
  const key = config.email?.sessionEncryptionKey || config.security?.encryptionKey;
  if (!key) {
    throw new AppError('Email session encryption key is not configured', ERROR_CODES.CONFIGURATION_MISSING, 500);
  }
  return key;
}

export async function subscribeMailbox({ userId, host, port, user, password, secure, mailbox }) {
  if (!userId || !host || !port || !user || !password || !mailbox) {
    throw new AppError(
      'userId, host, port, user, password, and mailbox are required',
      ERROR_CODES.VALIDATION_FAILED,
      400,
    );
  }

  const encryptionKey = getEncryptionKey();
  const passwordCipher = encryptPacked(password, encryptionKey);

  const { rows } = await db.query(
    `INSERT INTO email_connections
       (user_id, host, port, imap_user, password_cipher, secure, mailbox, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)
     ON CONFLICT (user_id) DO UPDATE
       SET host = EXCLUDED.host,
           port = EXCLUDED.port,
           imap_user = EXCLUDED.imap_user,
           password_cipher = EXCLUDED.password_cipher,
           secure = EXCLUDED.secure,
           mailbox = EXCLUDED.mailbox,
           updated_at = EXCLUDED.updated_at
     RETURNING id`,
    [userId, host, port, user, passwordCipher, Boolean(secure), mailbox, nowIso()],
  );

  const connectionId = rows[0]?.id;

  await emitEmailSessionConnected({ userId, mailbox }).catch((err) => logger.warn({ err }, 'Failed to emit email connected event'));

  logger.info({ userId, mailbox, connectionId }, 'Email IMAP mailbox subscribed');

  return { connectionId, mailbox };
}

export async function getMailboxConfig({ userId }) {
  if (!userId) {
    throw new AppError('userId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const { rows } = await db.query(
    `SELECT id, host, port, imap_user, password_cipher, secure, mailbox
       FROM email_connections
      WHERE user_id = $1
      LIMIT 1`,
    [userId],
  );

  const row = rows[0];
  if (!row) {
    return null;
  }

  const encryptionKey = getEncryptionKey();
  let password;
  try {
    password = decryptPacked(row.password_cipher, encryptionKey);
  } catch (err) {
    logger.error({ err, userId }, 'Failed to decrypt email password');
    throw new AppError('Email password could not be decrypted', ERROR_CODES.EMAIL_DECRYPT_FAILED, 500);
  }

  return {
    connectionId: row.id,
    host: row.host,
    port: row.port,
    user: row.imap_user,
    password,
    secure: row.secure,
    mailbox: row.mailbox,
  };
}

export async function unsubscribeMailbox({ userId, reason }) {
  if (!userId) {
    throw new AppError('userId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  await stop({ userId });
  await db.query(`DELETE FROM email_connections WHERE user_id = $1`, [userId]);

  await emitEmailSessionRevoked({ userId, reason }).catch((err) => logger.warn({ err }, 'Failed to emit email revoked event'));

  return { revoked: true };
}

export async function start({ userId }) {
  if (!userId) {
    throw new AppError('userId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (ACTIVE_LISTENERS.has(userId)) {
    return { listening: true, alreadyRunning: true };
  }

  const mailboxConfig = await getMailboxConfig({ userId });

  if (!mailboxConfig) {
    throw new AppError('Email mailbox is not configured', ERROR_CODES.EMAIL_CONNECTION_NOT_FOUND, 404);
  }

  const imapModule = await import('imapflow').catch(() => null);

  if (!imapModule || !imapModule.ImapFlow) {
    throw new AppError('IMAP library is not available', ERROR_CODES.CONFIGURATION_MISSING, 500);
  }

  const client = new imapModule.ImapFlow({
    host: mailboxConfig.host,
    port: mailboxConfig.port,
    secure: mailboxConfig.secure,
    auth: {
      user: mailboxConfig.user,
      pass: mailboxConfig.password,
    },
    logger: false,
  });

  client.on('error', (err) => {
    logger.error({ err, userId }, 'IMAP client error');
  });

  try {
    await client.connect();
    await client.mailboxOpen(mailboxConfig.mailbox);

    client.on('exists', async () => {
      try {
        for await (const message of client.fetch({ seen: false }, { source: true, envelope: true, uid: true })) {
          try {
            await handleEmailMessage({
              userId,
              mailbox: mailboxConfig.mailbox,
              raw: message.source,
              envelope: message.envelope,
              uid: message.uid,
            });
          } catch (err) {
            logger.error({ err, userId, uid: message.uid }, 'Failed to handle email message');
          }
        }
      } catch (err) {
        logger.error({ err, userId }, 'Failed to fetch new email messages');
      }
    });

    ACTIVE_LISTENERS.set(userId, { client, mailbox: mailboxConfig.mailbox, startedAt: Date.now() });

    logger.info({ userId, mailbox: mailboxConfig.mailbox }, 'IMAP listener started');

    return { listening: true, mailbox: mailboxConfig.mailbox };
  } catch (err) {
    logger.error({ err, userId }, 'Failed to start IMAP listener');
    throw new AppError('Failed to start IMAP listener', ERROR_CODES.EMAIL_LISTENER_START_FAILED, 502);
  }
}

export async function stop({ userId }) {
  if (!userId) {
    throw new AppError('userId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const entry = ACTIVE_LISTENERS.get(userId);

  if (!entry) {
    return { listening: false, reason: 'NOT_RUNNING' };
  }

  try {
    await entry.client.logout();
  } catch (err) {
    logger.warn({ err, userId }, 'Error during IMAP logout');
  }

  ACTIVE_LISTENERS.delete(userId);

  logger.info({ userId }, 'IMAP listener stopped');

  return { listening: false };
}

export async function stopAll() {
  const userIds = Array.from(ACTIVE_LISTENERS.keys());
  const results = [];
  for (const userId of userIds) {
    try {
      const result = await stop({ userId });
      results.push({ userId, ...result });
    } catch (err) {
      results.push({ userId, stopped: false, error: err.message });
    }
  }
  return results;
}

export function isRunning({ userId }) {
  return ACTIVE_LISTENERS.has(userId);
}

export function listRunning() {
  return Array.from(ACTIVE_LISTENERS.entries()).map(([userId, entry]) => ({
    userId,
    mailbox: entry.mailbox,
    startedAt: entry.startedAt,
  }));
}

export const imapListenerService = {
  subscribeMailbox,
  getMailboxConfig,
  unsubscribeMailbox,
  start,
  stop,
  stopAll,
  isRunning,
  listRunning,
};