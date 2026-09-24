/**
 * Referral Settled Listener
 *
 * @module server/events/listeners/referral-settled.listener
 */

import { subscribeToEvent } from '../event-subscriber';
import { EVENT_TYPES } from '../event-types';
import { logger } from '../../lib/logger';
import { db } from '../../database';

async function handler(envelope) {
  const payload = envelope.payload || {};

  if (!payload.referrerId) {
    return;
  }

  await db.query(
    `INSERT INTO notifications (user_id, type, category, priority, title, body, channels, status, created_at, updated_at)
     VALUES ($1, 'REFERRAL_CREDITED', 'REFERRAL', 'NORMAL', $2, $3, $4, 'QUEUED', NOW(), NOW())`,
    [
      payload.referrerId,
      'Referral reward credited',
      `You earned ${payload.amount} USD in referral rewards.`,
      JSON.stringify(['IN_APP']),
    ],
  );

  logger.debug({ referrerId: payload.referrerId }, 'Referral settlement handled');
}

export function registerReferralSettledListener() {
  subscribeToEvent(EVENT_TYPES.REFERRAL_REWARD_SETTLED, handler);
}