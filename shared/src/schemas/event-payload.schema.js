/**
 * Event Payload Schema
 *
 * Defines the generic envelope used by every event published on the
 * SignalForge Event Bus. Specialized events (signal, trade, payment)
 * embed their domain payloads inside this envelope.
 *
 * @module @signalforge/shared/schemas/event-payload
 */

import { EVENT_TYPE_VALUES } from '../constants/event-types.js';

export const EVENT_PAYLOAD_SCHEMA = Object.freeze({
  type: 'object',
  required: ['eventId', 'eventType', 'timestamp', 'source', 'payload'],
  properties: {
    eventId: { type: 'string', format: 'uuid' },
    eventType: { type: 'string', enum: EVENT_TYPE_VALUES },
    eventVersion: { type: 'number', minimum: 1, default: 1 },
    timestamp: { type: 'string', format: 'date-time' },
    source: { type: 'string', minLength: 1, maxLength: 128 },
    sourceVersion: { type: 'string', nullable: true, maxLength: 64 },
    correlationId: { type: 'string', nullable: true, maxLength: 128 },
    causationId: { type: 'string', nullable: true, maxLength: 128 },
    actorId: { type: 'string', format: 'uuid', nullable: true },
    actorType: { type: 'string', nullable: true, maxLength: 64 },
    tenantId: { type: 'string', nullable: true, maxLength: 128 },
    payload: { type: 'object' },
    metadata: { type: 'object', nullable: true },
  },
  additionalProperties: false,
});

export function buildEventPayload(input) {
  return {
    eventId: input.eventId,
    eventType: input.eventType,
    eventVersion: input.eventVersion ?? 1,
    timestamp: input.timestamp || new Date().toISOString(),
    source: input.source,
    sourceVersion: input.sourceVersion || null,
    correlationId: input.correlationId || null,
    causationId: input.causationId || null,
    actorId: input.actorId || null,
    actorType: input.actorType || null,
    tenantId: input.tenantId || null,
    payload: input.payload || {},
    metadata: input.metadata || null,
  };
}

export function validateEventPayload(event) {
  const errors = [];

  if (!event || typeof event !== 'object') {
    return { valid: false, errors: ['Event payload must be an object'] };
  }

  for (const field of EVENT_PAYLOAD_SCHEMA.required) {
    if (event[field] === undefined || event[field] === null) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  if (event.eventType && !EVENT_TYPE_VALUES.includes(event.eventType)) {
    errors.push(`Invalid eventType: ${event.eventType}`);
  }

  if (typeof event.payload !== 'object' || event.payload === null) {
    errors.push('Payload must be an object');
  }

  return { valid: errors.length === 0, errors };
}

export const EVENT_PAYLOAD_FIELDS = Object.freeze(
  Object.keys(EVENT_PAYLOAD_SCHEMA.properties),
);