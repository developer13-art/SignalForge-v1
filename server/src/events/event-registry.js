/**
 * Event Registry
 *
 * Maintains the set of valid event types and tracks which event
 * types have registered subscribers. Rejects publication of events
 * whose type is not registered.
 *
 * @module server/events/event-registry
 */

import { EVENT_TYPE_VALUES } from '@signalforge/shared/constants/event-types';
import { logger } from '../lib/logger';

const REGISTERED = new Set(EVENT_TYPE_VALUES);
const SUBSCRIBERS_COUNT = new Map();

export function registerEventType(eventType) {
  if (!eventType || typeof eventType !== 'string') {
    throw new Error('eventType must be a non-empty string');
  }

  REGISTERED.add(eventType);
  return { eventType };
}

export function isValidEventType(eventType) {
  return REGISTERED.has(eventType);
}

export function listRegisteredEventTypes() {
  return Array.from(REGISTERED).sort();
}

export function trackSubscriberAdded(eventType) {
  const current = SUBSCRIBERS_COUNT.get(eventType) || 0;
  SUBSCRIBERS_COUNT.set(eventType, current + 1);
}

export function trackSubscriberRemoved(eventType) {
  const current = SUBSCRIBERS_COUNT.get(eventType) || 0;
  if (current <= 1) {
    SUBSCRIBERS_COUNT.delete(eventType);
  } else {
    SUBSCRIBERS_COUNT.set(eventType, current - 1);
  }
}

export function getSubscriberCount(eventType) {
  return SUBSCRIBERS_COUNT.get(eventType) || 0;
}

export function listEventTypesWithSubscribers() {
  return Array.from(SUBSCRIBERS_COUNT.entries()).map(([eventType, count]) => ({
    eventType,
    subscriberCount: count,
  }));
}

export function describeRegistry() {
  return {
    totalRegistered: REGISTERED.size,
    totalWithSubscribers: SUBSCRIBERS_COUNT.size,
    withSubscribers: listEventTypesWithSubscribers(),
  };
}

export function assertValidEventType(eventType) {
  if (!isValidEventType(eventType)) {
    logger.warn({ eventType }, 'Attempted to publish an unregistered event type');
    throw new Error(`Unregistered event type: ${eventType}`);
  }
}

export const eventRegistry = {
  registerEventType,
  isValidEventType,
  listRegisteredEventTypes,
  trackSubscriberAdded,
  trackSubscriberRemoved,
  getSubscriberCount,
  listEventTypesWithSubscribers,
  describeRegistry,
  assertValidEventType,
};