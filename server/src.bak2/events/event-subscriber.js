/**
 * Event Subscriber
 *
 * Facade over the event bus for registering event handlers. Provides
 * ergonomic helpers for subscribing to single events, multiple
 * events, and category-based subscriptions.
 *
 * @module server/events/event-subscriber
 */
const { logger } = require('../lib/logger');
const { eventBus } = require('./event-bus');
const { getEventsForCategory } = require('./event-types');
function subscribeToEvent(eventType, handler) {
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
function subscribeToEvents(eventTypes, handler) {
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
function subscribeToCategory(category, handler) {
  if (!category || typeof handler !== 'function') {
    throw new Error('category and handler are required');
  }

  const eventTypes = getEventsForCategory(category);

  if (eventTypes.length === 0) {
    logger.warn({ category }, 'Subscribed to empty category');
  }

  return subscribeToEvents(eventTypes, handler);
}
function unsubscribeFromEvent(eventType, handler) {
  if (!eventType || typeof handler !== 'function') {
    return { removed: false };
  }

  eventBus.off(eventType, handler);
  return { removed: true };
}
const eventSubscriber = {
  subscribeToEvent,
  subscribeToEvents,
  subscribeToCategory,
  unsubscribeFromEvent,
};
module.exports.eventSubscriber = eventSubscriber;
module.exports.subscribeToEvent = subscribeToEvent;
module.exports.subscribeToEvents = subscribeToEvents;
module.exports.subscribeToCategory = subscribeToCategory;
module.exports.unsubscribeFromEvent = unsubscribeFromEvent;
