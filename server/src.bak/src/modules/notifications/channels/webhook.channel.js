/**
 * Webhook Notification Channel
 *
 * Delivers notifications via user-configured HTTP webhooks. Useful for
 * integrating with third-party systems.
 *
 * @module server/modules/notifications/channels/webhook.channel
 */
const crypto = require('node:crypto');
const { AppError } = require('../../../lib/errors/app-error');
const { ERROR_CODES } = require('../../../lib/errors/error-codes');
const { logger } = require('../../../lib/logger');
const { db } = require('../../../database');

async function listUserWebhooks({ userId }) {
  const { rows } = await db.query(
    `SELECT id, url, secret, active FROM user_webhooks WHERE user_id = $1 AND active = TRUE`,
    [userId],
  );
  return rows;
}

function signPayload({ payload, secret }) {
  if (!secret) {
    return null;
  }
  return crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
}
const webhookChannel = {
  name: 'WEBHOOK',

  async isAvailable({ user }) {
    if (!user) {
      return false;
    }
    const hooks = await listUserWebhooks({ userId: user.id });
    return hooks.length > 0;
  },

  async send({ notification, user }) {
    const hooks = await listUserWebhooks({ userId: user.id });

    if (hooks.length === 0) {
      return { delivered: false, skipped: true, reason: 'NO_WEBHOOKS' };
    }

    const payload = {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      body: notification.body,
      actionUrl: notification.action_url,
      createdAt: notification.created_at,
    };

    let delivered = 0;
    const references = [];

    for (const hook of hooks) {
      const signature = signPayload({ payload, secret: hook.secret });
      const headers = { 'Content-Type': 'application/json' };

      if (signature) {
        headers['X-SignalForge-Signature'] = signature;
      }

      try {
        const response = await fetch(hook.url, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          delivered++;
          references.push(hook.id);
        } else {
          logger.warn(
            { userId: user.id, webhookId: hook.id, status: response.status },
            'Webhook delivery failed',
          );
        }
      } catch (err) {
        logger.warn({ err, userId: user.id, webhookId: hook.id }, 'Webhook delivery error');
      }
    }

    return {
      delivered: delivered > 0,
      providerReference: references.join(',') || null,
    };
  },
};
module.exports = webhookChannel;
module.exports.webhookChannel = webhookChannel;
