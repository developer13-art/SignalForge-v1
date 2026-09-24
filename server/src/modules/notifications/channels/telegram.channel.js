/**
 * Telegram Notification Channel
 *
 * Delivers notifications via Telegram using a bot token. Falls back
 * gracefully if the user has not linked a Telegram chat for
 * notifications.
 *
 * @module server/modules/notifications/channels/telegram.channel
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { logger } from '../../../lib/logger';
import { config } from '../../../config';
import { db } from '../../../database';

async function findUserTelegramChat({ userId }) {
  const { rows } = await db.query(
    `SELECT chat_id FROM user_telegram_notifications WHERE user_id = $1 LIMIT 1`,
    [userId],
  );
  return rows[0] || null;
}

export const telegramChannel = {
  name: 'TELEGRAM',

  async isAvailable({ user }) {
    if (!user) {
      return false;
    }
    if (!config.telegram || !config.telegram.botToken) {
      return false;
    }
    const chat = await findUserTelegramChat({ userId: user.id });
    return Boolean(chat);
  },

  async send({ notification, user }) {
    if (!config.telegram || !config.telegram.botToken) {
      return { delivered: false, skipped: true, reason: 'BOT_TOKEN_NOT_CONFIGURED' };
    }

    const chat = await findUserTelegramChat({ userId: user.id });

    if (!chat || !chat.chat_id) {
      return { delivered: false, skipped: true, reason: 'NO_TELEGRAM_CHAT' };
    }

    const text = `${notification.title}${notification.body ? `\n\n${notification.body}` : ''}`;

    const url = `https://api.telegram.org/bot${config.telegram.botToken}/sendMessage`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chat.chat_id,
          text,
          disable_web_page_preview: true,
        }),
      });

      if (!response.ok) {
        const body = await response.text().catch(() => '');
        throw new Error(`Telegram send failed: ${response.status} ${body}`);
      }

      const result = await response.json();

      return {
        delivered: true,
        providerReference: result.result ? String(result.result.message_id) : null,
      };
    } catch (err) {
      logger.error({ err, userId: user.id }, 'Telegram notification delivery failed');
      throw new AppError('Telegram notification delivery failed', ERROR_CODES.NOTIFICATION_SEND_FAILED, 502);
    }
  },
};

export default telegramChannel;