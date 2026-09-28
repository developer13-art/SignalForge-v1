/**
 * Update Provider DNA Job
 *
 * @module server/jobs/job-types/update-provider-dna.job
 */

import { registerJobHandler } from '../job-registry';
import { logger } from '../../lib/logger';
import { EVENT_TYPES } from '@signalforge/shared/constants/event-types';
import { publishEvent } from '../../events/event-publisher';

async function handler(payload) {
  if (!payload.providerId) {
    return;
  }

  logger.debug({ providerId: payload.providerId }, 'Updating Provider DNA');

  try {
    const { learningService } = await import(
      '../../modules/provider-dna/learning/learning.service'
    );

    if (learningService && typeof learningService.reinforce === 'function') {
      await learningService.reinforce({ providerId: payload.providerId, signalId: payload.signalId });
    }
  } catch (err) {
    logger.warn({ err, providerId: payload.providerId }, 'Provider DNA update failed');
  }

  await publishEvent({
    eventType: EVENT_TYPES.PROVIDER_DNA_UPDATED,
    source: 'update-provider-dna.job',
    actorId: null,
    payload: {
      providerId: payload.providerId,
      signalId: payload.signalId,
    },
  });
}

export function registerUpdateProviderDnaJob() {
  registerJobHandler({
    jobType: 'UPDATE_PROVIDER_DNA',
    handler,
  });
}

export default handler;