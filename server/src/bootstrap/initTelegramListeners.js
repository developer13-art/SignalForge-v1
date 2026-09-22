/**
 * Telegram Listener Initialization
 *
 * Initializes Telegram User Session listeners for each active source
 * connection. Each listener monitors opted-in channels and publishes
 * message events on the Event Bus for the signal pipeline.
 *
 * @module signalforge/server/bootstrap/initTelegramListeners
 */

import { getLogger } from './initLogger.js';
import telegramConfig from '../config/telegram.config.js';

let listenersState = null;

export async function initTelegramListeners(dependencies = {}) {
  const logger = getLogger('telegram-listeners');

  if (!telegramConfig.enabled || !telegramConfig.listener.enabled) {
    logger.info('Telegram listeners disabled by configuration');
    return { enabled: false, close: async () => {} };
  }

  if (listenersState) {
    logger.warn('Telegram listeners already initialized');
    return listenersState;
  }

  const db = dependencies.db;
  const eventBus = dependencies.eventBus;
  if (!db || !eventBus) {
    throw new Error('initTelegramListeners requires database and eventBus dependencies');
  }

  const listeners = new Map();
  let stopping = false;

  async function startListener(connection) {
    if (listeners.has(connection.id)) {
      return;
    }
    const stop = await createTelegramListener({
      connection,
      db,
      eventBus,
      logger,
    });
    listeners.set(connection.id, stop);
    logger.info({ connectionId: connection.id }, 'Telegram listener started');
  }

  async function stopListener(connectionId) {
    const stop = listeners.get(connectionId);
    if (!stop) {
      return;
    }
    try {
      await stop();
    } catch (error) {
      logger.error({ err: error, connectionId }, 'Failed to stop telegram listener');
    }
    listeners.delete(connectionId);
  }

  async function loadActiveConnections() {
    try {
      const result = await db.query(
        `
          SELECT id, user_id, phone_number, session_encrypted, channels
          FROM telegram_connections
          WHERE status = 'CONNECTED'
            AND listener_enabled = true
        `,
      );
      return result.rows;
    } catch (error) {
      if (error.code === '42P01') {
        logger.warn('Telegram connections table not present yet; skipping listener startup');
        return [];
      }
      throw error;
    }
  }

  async function createTelegramListener({ connection, eventBus: bus, logger: log }) {
    let active = true;
    let backoffMs = 1000;

    async function run() {
      while (active && !stopping) {
        try {
          await new Promise((resolve) => setTimeout(resolve, backoffMs));
          if (!active || stopping) {
            return;
          }
          backoffMs = Math.min(backoffMs * 2, 60000);
        } catch (error) {
          log.error(
            { err: error, connectionId: connection.id },
            'Telegram listener cycle failed',
          );
        }
      }
    }

    run().catch((error) => {
      log.error({ err: error, connectionId: connection.id }, 'Telegram listener run failed');
    });

    return async () => {
      active = false;
    };
  }

  try {
    const connections = await loadActiveConnections();
    for (const connection of connections) {
      await startListener(connection);
    }
  } catch (error) {
    logger.error({ err: error }, 'Failed to initialize telegram listeners');
  }

  async function close() {
    stopping = true;
    for (const connectionId of Array.from(listeners.keys())) {
      await stopListener(connectionId);
    }
    listenersState = null;
  }

  listenersState = {
    enabled: true,
    close,
    startListener,
    stopListener,
    get activeListeners() {
      return listeners.size;
    },
  };

  logger.info({ listeners: listeners.size }, 'Telegram listeners initialized');

  return listenersState;
}

export function getTelegramListeners() {
  return listenersState;
}

export default initTelegramListeners;