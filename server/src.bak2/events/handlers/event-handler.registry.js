/**
 * Event Handler Registry
 *
 * Central registry of handlers keyed by event type. Services register
 * their handlers at bootstrap, and the registry exposes them so the
 * event bus can attach subscribers in one pass.
 *
 * @module server/events/handlers/event-handler.registry
 */
const { logger } = require('../../lib/logger');
const { subscribeToEvent } = require('../event-subscriber');
const { wrapAsyncHandler } = require('./async-handler.wrapper');

const HANDLERS = new Map();
function registerHandler({ eventType, name, handler, onError }) {
  if (!eventType || typeof handler !== 'function') {
    throw new Error('eventType and handler are required');
  }

  const list = HANDLERS.get(eventType) || [];
  list.push({ name, handler, onError });
  HANDLERS.set(eventType, list);

  logger.debug({ eventType, name }, 'Event handler registered');
}
function attachAllHandlers() {
  let attachedCount = 0;

  for (const [eventType, handlers] of HANDLERS.entries()) {
    for (const entry of handlers) {
      const wrapped = wrapAsyncHandler({
        name: `${eventType}:${entry.name || 'anonymous'}`,
        handler: entry.handler,
        onError: entry.onError,
      });

      subscribeToEvent(eventType, wrapped);
      attachedCount++;
    }
  }

  logger.info({ attachedCount }, 'Event handlers attached');

  return { attachedCount };
}
function listRegisteredHandlers() {
  return Array.from(HANDLERS.entries()).map(([eventType, handlers]) => ({
    eventType,
    handlers: handlers.map((h) => h.name),
  }));
}
function clearHandlerRegistry() {
  HANDLERS.clear();
}
const eventHandlerRegistry = {
  registerHandler,
  attachAllHandlers,
  listRegisteredHandlers,
  clearHandlerRegistry,
};
module.exports.eventHandlerRegistry = eventHandlerRegistry;
module.exports.registerHandler = registerHandler;
module.exports.attachAllHandlers = attachAllHandlers;
module.exports.listRegisteredHandlers = listRegisteredHandlers;
module.exports.clearHandlerRegistry = clearHandlerRegistry;
