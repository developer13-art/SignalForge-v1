/**
 * Events Module Index
 *
 * Central export for the platform Event Bus, publisher, subscriber,
 * store, replayer, metrics, and handlers.
 *
 * @module server/events
 */

export { eventBus, EventBus } from './event-bus';
export { registerEventType, listRegisteredEventTypes, isValidEventType } from './event-registry';
export { publishEvent, publishEventsBatch } from './event-publisher';
export { subscribeToEvent, subscribeToEvents, unsubscribeFromEvent } from './event-subscriber';
export { storeEvent, listStoredEvents, findStoredEventById } from './event-store';
export { replayEvents } from './event-replayer';
export { getEventMetrics, resetEventMetrics, recordEventPublish, recordEventHandler } from './event-metrics';
export { EVENT_TYPES, EVENT_CATEGORY_MAP } from './event-types';