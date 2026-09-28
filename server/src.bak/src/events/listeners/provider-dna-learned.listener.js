/**
 * Provider DNA Learned Listener
 *
 * When the Provider DNA engine learns a new rule, this listener
 * optionally triggers certification refreshes or reputation updates.
 *
 * @module server/events/listeners/provider-dna-learned.listener
 */
const { subscribeToEvent } = require('../event-subscriber');
const { EVENT_TYPES } = require('../event-types');
const { logger } = require('../../lib/logger');

async function handler(envelope) {
  const payload = envelope.payload || {};

  if (!payload.providerId) {
    return;
  }

  logger.info({ providerId: payload.providerId, eventId: envelope.eventId }, 'Provider DNA learning event processed');
}
function registerProviderDnaLearnedListener() {
  subscribeToEvent(EVENT_TYPES.PROVIDER_DNA_LEARNED, handler);
}
module.exports.registerProviderDnaLearnedListener = registerProviderDnaLearnedListener;
