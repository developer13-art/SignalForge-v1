/**
 * Discord Notification Channel
 *
 * Delivers notifications via Discord webhooks. Falls back gracefully
 * if the user has not linked a Discord webhook URL.
 *
 * @module server/modules/notifications/channels/discord.channel
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { logger } from '../../../lib/logger';
import { db } from '../../../database';

async function findUserWebhook({ userId }) {
  const { rows } = await db.query(
    `SELECT webhook_url FROM user_discord_notifications WHERE user_id = $1 LIMIT 1`,
    [userId],
  );
  return rows[0] || null;
}

export const discordChannel = {
  name: 'DISCORD',

  async isAvailable({ user }) {
    if (!user) {
      return false;
    }
    const hook = await findUserWebhook({ userId: user.id });
    return Boolean(hook && hook.webhook_url);
  },

  async send({ notification, user }) {
    const hook = await findUserWebhook({ userId: user.id });

    if (!hook || !hook.webhook_url) {
      return { delivered: false, skipped: true, reason: 'NO_DISCORD_WEBHOOK' };
    }

    const body = {
      content: `**${notification.title}**${notification.body ? `\n${notification.body}` : ''}`.substring(0, 2000),
    };

    try {
      const response = await fetch(hook.webhook_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok && response.status !== 204) {
        const text = await response.text().catch(() => '');
        throw new Error(`Discord send failed: ${response.status} ${text}`);
      }

      return { delivered: true, providerReference: null };
    } catch (err) {
      logger.error({ err, userId: user.id }, 'Discord notification delivery failed');
      throw new AppError('Discord notification delivery failed', ERROR_CODES.NOTIFICATION_SEND_FAILED, 502);
    }
  },
};

export default discordChannel;