/**
 * Event Bus
 *
 * In-process publish/subscribe bus. Handlers are registered per event
 * type and invoked in registration order. Handler failures are
 * isolated so one failing handler cannot block others. Every
 * published event is persisted to the event store for audit and
 * replay.
 *
 * @module server/events/event-bus
 */

import { EventEmitter } from 'node:events';
import crypto from 'node:crypto';
import { logger } from '../lib/logger';
import { eventStore } from './event-store';
import { eventMetrics } from './event-metrics';
import { eventRegistry } from './event-registry';

class EventBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(200);
    this.handlers = new Map();
  }

  on(eventType, handler) {
    if (typeof handler !== 'function') {
      throw new Error('handler must be a function');
    }

    const list = this.handlers.get(eventType) || [];
    list.push(handler);
    this.handlers.set(eventType, list);

    eventRegistry.trackSubscriberAdded(eventType);

    super.on(eventType, handler);
    return this;
  }

  off(eventType, handler) {
    const list = this.handlers.get(eventType) || [];
    const filtered = list.filter((h) => h !== handler);

    if (filtered.length === 0) {
      this.handlers.delete(eventType);
    } else {
      this.handlers.set(eventType, filtered);
    }

    eventRegistry.trackSubscriberRemoved(eventType);
    super.off(eventType, handler);

    return this;
  }

  async publish(eventEnvelope) {
    const start = Date.now();

    const eventId = eventEnvelope.eventId || crypto.randomUUID();
    const eventType = eventEnvelope.eventType;

    if (!eventType) {
      throw new Error('eventType is required to publish an event');
    }

    const envelope = {
      ...eventEnvelope,
      eventId,
      timestamp: eventEnvelope.timestamp || new Date().toISOString(),
      eventVersion: eventEnvelope.eventVersion || 1,
    };

    await eventStore.storeEvent({
      eventId,
      eventType,
      source: envelope.source,
      actorId: envelope.actorId,
      actorType: envelope.actorType,
      payload: envelope.payload,
      correlationId: envelope.correlationId,
      causationId: envelope.causationId,
      tenantId: envelope.tenantId,
      metadata: envelope.metadata,
    });

    const handlers = this.handlers.get(eventType) || [];

    const results = [];

    for (const handler of handlers) {
      const handlerStart = Date.now();
      try {
        await handler(envelope);
        const duration = Date.now() - handlerStart;
        eventMetrics.recordEventHandler({ eventType, durationMs: duration });
        results.push({ handler, success: true, durationMs: duration });
      } catch (err) {
        const duration = Date.now() - handlerStart;
        eventMetrics.recordEventFailure({ eventType, error: err });
        logger.error({ err, eventType, eventId }, 'Event handler threw');
        results.push({ handler, success: false, durationMs: duration, error: err.message });
      }
    }

    const duration = Date.now() - start;
    eventMetrics.recordEventPublish({ eventType, durationMs: duration });

    // Also emit via EventEmitter for legacy listeners that use .on()
    try {
      super.emit(eventType, envelope);
    } catch (err) {
      logger.error({ err, eventType, eventId }, 'Synchronous event listener threw');
    }

    return {
      eventId,
      eventType,
      handled: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      durationMs: duration,
      results,
    };
  }

  listHandlers() {
    return Array.from(this.handlers.entries()).map(([eventType, list]) => ({
      eventType,
      handlerCount: list.length,
    }));
  }

  clearAll() {
    for (const eventType of this.handlers.keys()) {
      super.removeAllListeners(eventType);
    }
    this.handlers.clear();
  }
}

export const eventBus = new EventBus();

export { EventBus };