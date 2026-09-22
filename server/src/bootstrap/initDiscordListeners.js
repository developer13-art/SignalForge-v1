/**
 * Discord Listener Initialization
 *
 * Initializes Discord bot listeners for each active source connection.
 *
 * @module signalforge/server/bootstrap/initDiscordListeners
 */

import { getLogger } from './initLogger.js';
import discordConfig from '../config/discord.config.js';

let listenersState = null;

export async function initDiscordListeners(dependencies = {}) {
  const logger = getLogger('discord-listeners');

  if (!discordConfig.enabled || !discordConfig.listener.enabled) {
    logger.info('Discord listeners disabled by configuration');
    return { enabled: false, close: async () => {} };
  }

  if (listenersState) {
    logger.warn('Discord listeners already initialized');
    return listenersState;
  }

  const db = dependencies.db;
  const eventBus = dependencies.eventBus;
  if (!db || !eventBus) {
    throw new Error('initDiscordListeners requires database and eventBus dependencies');
  }

  const listeners = new Map();
  let stopping = false;

  async function loadActiveConnections() {
    try {
      const result = await db.query(
        `
          SELECT id, user_id, guild_id, channel_ids, bot_enabled
          FROM discord_connections
          WHERE status = 'CONNECTED'
            AND listener_enabled = true
        `,
      );
      return result.rows;
    } catch (error) {
      if (error.code === '42P01') {
        logger.warn('Discord connections table not present yet; skipping listener startup');
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
    logger.info({ connectionId: connection.id }, 'Discord listener started');
  }

  async function stopListener(connectionId) {
    const stop = listeners.get(connectionId);
    if (!stop) {
      return;
    }
    try {
      await stop();
    } catch (error) {
      logger.error({ err: error, connectionId }, 'Failed to stop discord listener');
    }
    listeners.delete(connectionId);
  }

  try {
    const connections = await loadActiveConnections();
    for (const connection of connections) {
      await startListener(connection);
    }
  } catch (error) {
    logger.error({ err: error }, 'Failed to initialize discord listeners');
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

  logger.info({ listeners: listeners.size }, 'Discord listeners initialized');

  return listenersState;
}

export function getDiscordListeners() {
  return listenersState;
}

export default initDiscordListeners;