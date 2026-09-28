/**
 * Event Replayer
 *
 * Replays historical events from the event store. Used by the replay
 * center, support tools, and disaster-recovery workflows.
 *
 * @module server/events/event-replayer
 */

import { eventStore } from './event-store';
import { eventBus } from './event-bus';
import { logger } from '../lib/logger';

export async function replayEvents({
  filters = {},
  pagination = {},
  skipPublish = false,
  handler = null,
}) {
  const result = await eventStore.listStoredEvents({ filters, pagination });

  const events = result.items.reverse();

  const replayed = [];

  for (const event of events) {
    const envelope = {
      eventId: event.id,
      eventType: event.event_type,
      eventVersion: 1,
      timestamp: event.created_at,
      source: event.source,
      actorId: event.actor_id,
      actorType: event.actor_type,
      payload: event.payload ? JSON.parse(event.payload) : {},
      correlationId: event.correlation_id,
      causationId: event.causation_id,
      tenantId: event.tenant_id,
      metadata: event.metadata ? JSON.parse(event.metadata) : null,
    };

    if (typeof handler === 'function') {
      try {
        await handler(envelope);
        replayed.push({ eventId: envelope.eventId, handled: true });
      } catch (err) {
        logger.warn({ err, eventId: envelope.eventId }, 'Handler failed during replay');
        replayed.push({ eventId: envelope.eventId, handled: false, error: err.message });
      }
      continue;
    }

    if (!skipPublish) {
      try {
        await eventBus.publish(envelope);
        replayed.push({ eventId: envelope.eventId, published: true });
      } catch (err) {
        logger.warn({ err, eventId: envelope.eventId }, 'Replay publish failed');
        replayed.push({ eventId: envelope.eventId, published: false, error: err.message });
      }
    } else {
      replayed.push({ eventId: envelope.eventId, skipped: true });
    }
  }

  logger.info({ count: replayed.length }, 'Event replay complete');

  return {
    total: result.total,
    replayed: replayed.length,
    results: replayed,
  };
}

export async function replayByCorrelation({ correlationId }) {
  if (!correlationId) {
    throw new Error('correlationId is required');
  }

  return replayEvents({
    filters: { correlationId },
    pagination: { limit: 1000, offset: 0 },
  });
}

export const eventReplayer = {
  replayEvents,
  replayByCorrelation,
};