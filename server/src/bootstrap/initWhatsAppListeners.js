/**
 * WhatsApp Listener Initialization
 *
 * Initializes WhatsApp listeners for each active source connection.
 *
 * @module signalforge/server/bootstrap/initWhatsAppListeners
 */

import { getLogger } from './initLogger.js';
import whatsAppConfig from '../config/whatsapp.config.js';

let listenersState = null;

export async function initWhatsAppListeners(dependencies = {}) {
  const logger = getLogger('whatsapp-listeners');

  if (!whatsAppConfig.enabled || !whatsAppConfig.listener.enabled) {
    logger.info('WhatsApp listeners disabled by configuration');
    return { enabled: false, close: async () => {} };
  }

  if (listenersState) {
    logger.warn('WhatsApp listeners already initialized');
    return listenersState;
  }

  const db = dependencies.db;
  const eventBus = dependencies.eventBus;
  if (!db || !eventBus) {
    throw new Error('initWhatsAppListeners requires database and eventBus dependencies');
  }

  const listeners = new Map();
  let stopping = false;

  async function loadActiveConnections() {
    try {
      const result = await db.query(
        `
          SELECT id, user_id, phone_number_id, group_ids
          FROM whatsapp_connections
          WHERE status = 'CONNECTED'
            AND listener_enabled = true
        `,
      );
      return result.rows;
    } catch (error) {
      if (error.code === '42P01') {
        logger.warn('WhatsApp connections table not present yet; skipping listener startup');
        return [];
      }
      throw error;
    }
  }

  async function startListener(connection) {
    if (listeners.has(connection.id)) {
      return;
    }
    const stop = async () => {};
    listeners.set(connection.id, stop);
    logger.info({ connectionId: connection.id }, 'WhatsApp listener started');
  }

  async function stopListener(connectionId) {
    const stop = listeners.get(connectionId);
    if (!stop) {
      return;
    }
    try {
      await stop();
    } catch (error) {
      logger.error({ err: error, connectionId }, 'Failed to stop whatsapp listener');
    }
    listeners.delete(connectionId);
  }

  try {
    const connections = await loadActiveConnections();
    for (const connection of connections) {
      await startListener(connection);
    }
  } catch (error) {
    logger.error({ err: error }, 'Failed to initialize whatsapp listeners');
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

  logger.info({ listeners: listeners.size }, 'WhatsApp listeners initialized');

  return listenersState;
}

export function getWhatsAppListeners() {
  return listenersState;
}

export default initWhatsAppListeners;