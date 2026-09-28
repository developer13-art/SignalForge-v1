/**
 * Monthly Referral Settlement Job
 *
 * @module server/jobs/job-types/monthly-referral-settlement.job
 */

import { registerJobHandler } from '../job-registry';
import { logger } from '../../lib/logger';
import { EVENT_TYPES } from '@signalforge/shared/constants/event-types';
import { publishEvent } from '../../events/event-publisher';
import { db } from '../../database';

async function handler(payload) {
  const period = payload.period;

  if (!period || !/^\d{4}-\d{2}$/.test(period)) {
    logger.warn({ period }, 'Monthly referral settlement requires a valid period');
    return;
  }

  const { rows: relationships } = await db.query(
    `SELECT referrer_id, referred_user_id
       FROM referral_relationships
      WHERE status = 'ACTIVE'`,
  );

  logger.info({ period, relationshipCount: relationships.length }, 'Referral settlement started');

  await publishEvent({
    eventType: EVENT_TYPES.REFERRAL_SETTLEMENT_STARTED,
    source: 'monthly-referral-settlement.job',
    actorId: null,
    payload: { period },
  });

  let totalRewardAmount = 0;

  for (const rel of relationships) {
    const { rows: periodRows } = await db.query(
      `SELECT eligible_net_profit
         FROM performance_periods
        WHERE user_id = $1 AND period = $2
        LIMIT 1`,
      [rel.referred_user_id, period],
    );

    const eligible = Number(periodRows[0]?.eligible_net_profit || 0);

    if (eligible <= 0) {
      continue;
    }

    const rewardRate = 0.001;
    const rewardAmount = Number((eligible * rewardRate).toFixed(8));

    await db.query(
      `INSERT INTO referral_rewards
         (referrer_id, referred_user_id, settlement_period, eligible_net_profit, reward_rate, reward_amount, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, 'CALCULATED', NOW(), NOW())
       ON CONFLICT (referrer_id, referred_user_id, settlement_period) DO NOTHING`,
      [rel.referrer_id, rel.referred_user_id, period, eligible, rewardRate, rewardAmount],
    );

    totalRewardAmount += rewardAmount;
  }

  await db.query(
    `INSERT INTO referral_settlements (period, status, total_reward_amount, completed_at, created_at, updated_at)
     VALUES ($1, 'COMPLETED', $2, NOW(), NOW(), NOW())
     ON CONFLICT (period) DO UPDATE
       SET status = 'COMPLETED', total_reward_amount = EXCLUDED.total_reward_amount, completed_at = NOW(), updated_at = NOW()`,
    [period, totalRewardAmount],
  );

  await publishEvent({
    eventType: EVENT_TYPES.REFERRAL_SETTLEMENT_COMPLETED,
    source: 'monthly-referral-settlement.job',
    actorId: null,
    payload: { period, totalRewardAmount },
  });

  return { period, totalRewardAmount };
}

export function registerMonthlyReferralSettlementJob() {
  registerJobHandler({
    jobType: 'MONTHLY_REFERRAL_SETTLEMENT',
    handler,
  });
}

export default handler;