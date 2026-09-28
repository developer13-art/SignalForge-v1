/**
 * Validate Signal Job
 *
 * @module server/jobs/job-types/validate-signal.job
 */

import { registerJobHandler } from '../job-registry';
import { logger } from '../../lib/logger';
import { EVENT_TYPES } from '@signalforge/shared/constants/event-types';
import { publishEvent } from '../../events/event-publisher';

async function handler(payload) {
  if (!payload.signalId) {
    return;
  }

  let valid = true;
  let reason = null;

  try {
    const { validationService } = await import('../../modules/validation/validation.service');

    if (validationService && typeof validationService.validate === 'function') {
      const result = await validationService.validate({ signalId: payload.signalId });
      valid = result.valid;
      reason = result.reason;
    }
  } catch (err) {
    logger.warn({ err, signalId: payload.signalId }, 'Validation service unavailable');
  }

  await publishEvent({
    eventType: valid ? EVENT_TYPES.SIGNAL_VALIDATED : EVENT_TYPES.SIGNAL_VALIDATION_FAILED,
    source: 'validate-signal.job',
    actorId: null,
    payload: {
      signalId: payload.signalId,
      providerId: payload.providerId || null,
      reason,
    },
  });
}

export function registerValidateSignalJob() {
  registerJobHandler({
    jobType: 'VALIDATE_SIGNAL',
    handler,
  });
}

export default handler;