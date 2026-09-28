/**
 * Provider DNA Learned Listener
 *
 * When the Provider DNA engine learns a new rule, this listener
 * optionally triggers certification refreshes or reputation updates.
 *
 * @module server/events/listeners/provider-dna-learned.listener
 */

import { subscribeToEvent } from '../event-subscriber';
import { EVENT_TYPES } from '../event-types';
import { logger } from '../../lib/logger';

async function handler(envelope) {
  const payload = envelope.payload || {};

  if (!payload.providerId) {
    return;
  }

  logger.info({ providerId: payload.providerId, eventId: envelope.eventId }, 'Provider DNA learning event processed');
}

export function registerProviderDnaLearnedListener() {
  subscribeToEvent(EVENT_TYPES.PROVIDER_DNA_LEARNED, handler);
}