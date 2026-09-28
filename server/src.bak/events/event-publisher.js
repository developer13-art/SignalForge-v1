/**
 * Event Publisher
 *
 * Thin facade over the event bus that also emits platform events
 * according to the standard envelope format. All services should
 * publish through this module to guarantee envelope shape and
 * telemetry.
 *
 * @module server/events/event-publisher
 */

import crypto from 'node:crypto';
import { logger } from '../lib/logger';
import { eventBus } from './event-bus';

export async function publishEvent({
  eventType,
  source,
  actorId,
  actorType,
  payload,
  correlationId,
  causationId,
  tenantId,
  metadata,
}) {
  if (!eventType) {
    throw new Error('eventType is required');
  }

  const eventId = crypto.randomUUID();

  const envelope = {
    eventId,
    eventType,
    eventVersion: 1,
    timestamp: new Date().toISOString(),
    source: source || 'unknown',
    actorId: actorId || null,
    actorType: actorType || null,
    payload: payload || {},
    correlationId: correlationId || null,
    causationId: causationId || null,
    tenantId: tenantId || null,
    metadata: metadata || null,
  };

  try {
    const result = await eventBus.publish(envelope);
    return result;
  } catch (err) {
    logger.error({ err, eventType, eventId }, 'Event publication failed');
    throw err;
  }
}

export async function publishEventsBatch(events) {
  if (!Array.isArray(events) || events.length === 0) {
    return { published: 0, results: [] };
  }

  const results = [];

  for (const event of events) {
    try {
      const result = await publishEvent(event);
      results.push({ eventId: result.eventId, published: true });
    } catch (err) {
      results.push({ published: false, error: err.message });
    }
  }

  return {
    published: results.filter((r) => r.published).length,
    results,
  };
}

export const eventPublisher = {
  publishEvent,
  publishEventsBatch,
};