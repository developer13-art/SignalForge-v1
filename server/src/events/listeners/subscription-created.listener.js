/**
 * Subscription Created Listener
 *
 * @module server/events/listeners/subscription-created.listener
 */

import { subscribeToEvent } from '../event-subscriber';
import { EVENT_TYPES } from '../event-types';
import { logger } from '../../lib/logger';
import { db } from '../../database';

async function handler(envelope) {
  const payload = envelope.payload || {};

  if (!payload.userId) {
    return;
  }

  await db.query(
    `INSERT INTO notifications (user_id, type, category, priority, title, body, channels, status, created_at, updated_at)
     VALUES ($1, 'SUBSCRIPTION_ACTIVATED', 'SUBSCRIPTION', 'NORMAL', $2, $3, $4, 'QUEUED', NOW(), NOW())`,
    [
      payload.userId,
      'Subscription activated',
      `Your ${payload.planCode || 'subscription'} is now active.`,
      JSON.stringify(['IN_APP', 'EMAIL']),
    ],
  );

  logger.debug({ userId: payload.userId, planCode: payload.planCode }, 'Subscription activation handled');
}

export function registerSubscriptionCreatedListener() {
  subscribeToEvent(EVENT_TYPES.SUBSCRIPTION_CREATED, handler);
}