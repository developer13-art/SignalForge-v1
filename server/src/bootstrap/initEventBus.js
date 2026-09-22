/**
 * Event Bus Initialization
 *
 * Initializes the platform-wide Event Bus. Uses PostgreSQL LISTEN /
 * NOTIFY for cross-process delivery and an in-process EventEmitter
 * for local subscribers.
 *
 * @module signalforge/server/bootstrap/initEventBus
 */

import { EventEmitter } from 'node:events';
import { randomUUID } from 'node:crypto';

import { getLogger } from './initLogger.js';
import databaseConfig from '../config/database.config.js';

const CHANNEL_NAME = 'signalforge_events';
const MAX_LISTENERS = 500;

let busState = null;

function isEnvelope(value) {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.eventId === 'string' &&
    typeof value.eventType === 'string' &&
    typeof value.timestamp === 'string' &&
    typeof value.payload === 'object'
  );
}

export async function initEventBus(dependencies = {}) {
  const logger = getLogger('event-bus');

  if (busState) {
    logger.warn('Event bus already initialized');
    return busState;
  }

  const db = dependencies.db;
  if (!db || typeof db.withClient !== 'function') {
    throw new Error('initEventBus requires a database dependency');
  }

  const emitter = new EventEmitter();
  emitter.setMaxListeners(MAX_LISTENERS);

  let listenClient = null;
  let closing = false;

  async function acquireListenClient() {
    listenClient = await db.pool.connect();
    listenClient.on('notification', (msg) => {
      if (msg.channel !== CHANNEL_NAME || !msg.payload) {
        return;
      }
      try {
        const envelope = JSON.parse(msg.payload);
        if (!isEnvelope(envelope)) {
          logger.warn({ payload: msg.payload }, 'Invalid event envelope received');
          return;
        }
        emitter.emit(envelope.eventType, envelope);
        emitter.emit('*', envelope);
      } catch (error) {
        logger.error({ err: error }, 'Failed to parse event payload');
      }
    });

    listenClient.on('error', (error) => {
      logger.error({ err: error }, 'Event bus listen client error');
      if (!closing) {
        setTimeout(acquireListenClient, 5000).catch(() => {});
      }
    });

    await listenClient.query(`LISTEN ${CHANNEL_NAME}`);
  }

  await acquireListenClient();

  async function publish(eventType, payload, options = {}) {
    if (typeof eventType !== 'string' || eventType.length === 0) {
      throw new Error('publish requires a non-empty eventType');
    }

    const envelope = {
      eventId: options.eventId || randomUUID(),
      eventType,
      eventVersion: options.eventVersion || 1,
      timestamp: options.timestamp || new Date().toISOString(),
      source: options.source || 'signalforge',
      sourceVersion: options.sourceVersion || null,
      correlationId: options.correlationId || null,
      causationId: options.causationId || null,
      actorId: options.actorId || null,
      actorType: options.actorType || null,
      tenantId: options.tenantId || null,
      payload: payload || {},
      metadata: options.metadata || null,
    };

    const serialized = JSON.stringify(envelope);
    if (serialized.length > 8000) {
      logger.warn(
        { eventType, size: serialized.length },
        'Event payload is large; consider moving data to storage',
      );
    }

    await db.query(`SELECT pg_notify($1, $2)`, [CHANNEL_NAME, serialized]);

    emitter.emit(eventType, envelope);
    emitter.emit('*', envelope);

    return envelope;
  }

  function subscribe(eventType, handler) {
    if (typeof eventType !== 'string' || typeof handler !== 'function') {
      throw new Error('subscribe requires an eventType and handler function');
    }
    emitter.on(eventType, handler);
    return () => emitter.off(eventType, handler);
  }

  function subscribeOnce(eventType, handler) {
    emitter.once(eventType, handler);
    return () => emitter.off(eventType, handler);
  }

  async function close() {
    closing = true;
    if (listenClient) {
      try {
        await listenClient.query(`UNLISTEN ${CHANNEL_NAME}`);
      } catch {
        // ignore
      }
      listenClient.release();
      listenClient = null;
    }
    emitter.removeAllListeners();
    busState = null;
  }

  busState = {
    publish,
    subscribe,
    subscribeOnce,
    close,
    emitter,
    channel: CHANNEL_NAME,
    get listenerCount() {
      return emitter.eventNames().reduce(
        (total, name) => total + emitter.listenerCount(name),
        0,
      );
    },
  };

  logger.info({ channel: CHANNEL_NAME }, 'Event bus initialized');

  return busState;
}

export function getEventBus() {
  if (!busState) {
    throw new Error('Event bus has not been initialized');
  }
  return busState;
}

export default initEventBus;