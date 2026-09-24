/**
 * Async Handler Wrapper
 *
 * Wraps an event handler so that failures are logged with context but
 * do not propagate. Ensures a single failing handler cannot abort the
 * entire event dispatch.
 *
 * @module server/events/handlers/async-handler.wrapper
 */

import { logger } from '../../lib/logger';

export function wrapAsyncHandler({ name, handler, onError = null }) {
  if (typeof handler !== 'function') {
    throw new Error('handler must be a function');
  }

  const handlerName = name || handler.name || 'anonymous';

  return async function wrappedHandler(envelope) {
    const start = Date.now();

    try {
      const result = await handler(envelope);
      const durationMs = Date.now() - start;
      logger.debug({ handler: handlerName, durationMs, eventId: envelope.eventId }, 'Handler succeeded');
      return result;
    } catch (err) {
      const durationMs = Date.now() - start;
      logger.error({ err, handler: handlerName, durationMs, eventId: envelope.eventId }, 'Handler failed');
      if (typeof onError === 'function') {
        try {
          await onError({ err, envelope, handler: handlerName });
        } catch (innerErr) {
          logger.error({ innerErr }, 'onError callback failed');
        }
      }
      return null;
    }
  };
}

export const asyncHandlerWrapper = {
  wrapAsyncHandler,
};