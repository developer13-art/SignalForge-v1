/**
 * Fan Out Signal Job
 *
 * @module server/jobs/job-types/fan-out-signal.job
 */

import { registerJobHandler } from '../job-registry';
import { logger } from '../../lib/logger';
import { EVENT_TYPES } from '@signalforge/shared/constants/event-types';
import { publishEvent } from '../../events/event-publisher';
import { db } from '../../database';

async function handler(payload) {
  if (!payload.signalId) {
    return;
  }

  const { rows } = await db.query(
    `SELECT id, provider_id FROM signals WHERE id = $1 LIMIT 1`,
    [payload.signalId],
  );

  const signal = rows[0];

  if (!signal) {
    return;
  }

  const { rows: subscriberRows } = await db.query(
    `SELECT user_id FROM provider_subscriptions
      WHERE provider_id = $1 AND status = 'ACTIVE'`,
    [signal.provider_id],
  );

  logger.info(
    { signalId: payload.signalId, subscriberCount: subscriberRows.length },
    'Fan-out starting',
  );

  await publishEvent({
    eventType: EVENT_TYPES.SIGNAL_FANOUT_COMPLETED,
    source: 'fan-out-signal.job',
    actorId: null,
    payload: {
      signalId: signal.id,
      subscriberCount: subscriberRows.length,
    },
  });
}

export function registerFanOutSignalJob() {
  registerJobHandler({
    jobType: 'FAN_OUT_SIGNAL',
    handler,
  });
}

export default handler;