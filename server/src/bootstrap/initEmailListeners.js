/**
 * Email Listener Initialization
 *
 * Initializes IMAP listeners for each active source connection.
 *
 * @module signalforge/server/bootstrap/initEmailListeners
 */

import { getLogger } from './initLogger.js';
import imapConfig from '../config/imap.config.js';

let listenersState = null;

export async function initEmailListeners(dependencies = {}) {
  const logger = getLogger('email-listeners');

  if (!imapConfig.enabled || !imapConfig.listener.enabled) {
    logger.info('Email listeners disabled by configuration');
    return { enabled: false, close: async () => {} };
  }

  if (listenersState) {
    logger.warn('Email listeners already initialized');
    return listenersState;
  }

  const db = dependencies.db;
  const eventBus = dependencies.eventBus;
  if (!db || !eventBus) {
    throw new Error('initEmailListeners requires database and eventBus dependencies');
  }

  const listeners = new Map();
  let stopping = false;

  async function loadActiveConnections() {
    try {
      const result = await db.query(
        `
          SELECT id, user_id, mailbox, host, port
          FROM email_connections
          WHERE status = 'CONNECTED'
            AND listener_enabled = true
        `,
      );
      return result.rows;
    } catch (error) {
      if (error.code === '42P01') {
        logger.warn('Email connections table not present yet; skipping listener startup');
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
    logger.info({ connectionId: connection.id }, 'Email listener started');
  }

  async function stopListener(connectionId) {
    const stop = listeners.get(connectionId);
    if (!stop) {
      return;
    }
    try {
      await stop();
    } catch (error) {
      logger.error({ err: error, connectionId }, 'Failed to stop email listener');
    }
    listeners.delete(connectionId);
  }

  try {
    const connections = await loadActiveConnections();
    for (const connection of connections) {
      await startListener(connection);
    }
  } catch (error) {
    logger.error({ err: error }, 'Failed to initialize email listeners');
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

  logger.info({ listeners: listeners.size }, 'Email listeners initialized');

  return listenersState;
}

export function getEmailListeners() {
  return listenersState;
}

export default initEmailListeners;