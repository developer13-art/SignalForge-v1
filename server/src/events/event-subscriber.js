/**
 * Event Subscriber
 *
 * Facade over the event bus for registering event handlers. Provides
 * ergonomic helpers for subscribing to single events, multiple
 * events, and category-based subscriptions.
 *
 * @module server/events/event-subscriber
 */

import { logger } from '../lib/logger';
import { eventBus } from './event-bus';
import { getEventsForCategory } from './event-types';

export function subscribeToEvent(eventType, handler) {
  if (!eventType || typeof handler !== 'function') {
    throw new Error('eventType and handler are required');
  }

  eventBus.on(eventType, handler);

  logger.debug({ eventType }, 'Subscribed to event');

  return {
    eventType,
    unsubscribe: () => {
      eventBus.off(eventType, handler);
      logger.debug({ eventType }, 'Unsubscribed from event');
    },
  };
}

export function subscribeToEvents(eventTypes, handler) {
  if (!Array.isArray(eventTypes) || typeof handler !== 'function') {
    throw new Error('eventTypes array and handler are required');
  }

  const subscriptions = eventTypes.map((eventType) => subscribeToEvent(eventType, handler));

  return {
    eventTypes,
    unsubscribe: () => {
      for (const sub of subscriptions) {
        sub.unsubscribe();
      }
    },
  };
}

export function subscribeToCategory(category, handler) {
  if (!category || typeof handler !== 'function') {
    throw new Error('category and handler are required');
  }

  const eventTypes = getEventsForCategory(category);

  if (eventTypes.length === 0) {
    logger.warn({ category }, 'Subscribed to empty category');
  }

  return subscribeToEvents(eventTypes, handler);
}

export function unsubscribeFromEvent(eventType, handler) {
  if (!eventType || typeof handler !== 'function') {
    return { removed: false };
  }

  eventBus.off(eventType, handler);
  return { removed: true };
}

export const eventSubscriber = {
  subscribeToEvent,
  subscribeToEvents,
  subscribeToCategory,
  unsubscribeFromEvent,
};