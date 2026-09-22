/**
 * Signal Event Schema
 *
 * Defines the structure of a signal event published on the Event Bus.
 * Every stage of the signal pipeline emits a signal event with a
 * consistent envelope.
 *
 * @module @signalforge/shared/schemas/signal-event
 */

import { EVENT_TYPES, EVENT_TYPE_VALUES } from '../constants/event-types.js';
import { SIGNAL_STATUS_VALUES } from '../constants/signal-statuses.js';

export const SIGNAL_EVENT_SCHEMA = Object.freeze({
  type: 'object',
  required: ['eventId', 'eventType', 'signalId', 'timestamp', 'payload'],
  properties: {
    eventId: { type: 'string', format: 'uuid' },
    eventType: { type: 'string', enum: EVENT_TYPE_VALUES },
    signalId: { type: 'string', format: 'uuid' },
    providerId: { type: 'string', format: 'uuid', nullable: true },
    userId: { type: 'string', format: 'uuid', nullable: true },
    tradeId: { type: 'string', format: 'uuid', nullable: true },
    status: { type: 'string', enum: SIGNAL_STATUS_VALUES, nullable: true },
    timestamp: { type: 'string', format: 'date-time' },
    correlationId: { type: 'string', nullable: true },
    causationId: { type: 'string', nullable: true },
    payload: { type: 'object' },
    metadata: { type: 'object', nullable: true },
  },
  additionalProperties: false,
});

export function buildSignalEvent(input) {
  return {
    eventId: input.eventId,
    eventType: input.eventType,
    signalId: input.signalId,
    providerId: input.providerId || null,
    userId: input.userId || null,
    tradeId: input.tradeId || null,
    status: input.status || null,
    timestamp: input.timestamp || new Date().toISOString(),
    correlationId: input.correlationId || null,
    causationId: input.causationId || null,
    payload: input.payload || {},
    metadata: input.metadata || null,
  };
}

export function validateSignalEvent(event) {
  const errors = [];

  if (!event || typeof event !== 'object') {
    return { valid: false, errors: ['Event must be an object'] };
  }

  for (const field of SIGNAL_EVENT_SCHEMA.required) {
    if (event[field] === undefined || event[field] === null) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  if (event.eventType && !EVENT_TYPE_VALUES.includes(event.eventType)) {
    errors.push(`Invalid eventType: ${event.eventType}`);
  }

  if (event.status && !SIGNAL_STATUS_VALUES.includes(event.status)) {
    errors.push(`Invalid status: ${event.status}`);
  }

  return { valid: errors.length === 0, errors };
}

export const SIGNAL_EVENT_FIELDS = Object.freeze(
  Object.keys(SIGNAL_EVENT_SCHEMA.properties),
);