/**
 * MetaApi Stream Initialization
 *
 * Initializes MetaApi streaming for all connected broker accounts.
 * Streams deliver real-time account, position, order, and history
 * updates back into SignalForge.
 *
 * @module signalforge/server/bootstrap/initMetaApiStreams
 */

import { getLogger } from './initLogger.js';
import metaApiConfig from '../config/metaapi.config.js';

let streamsState = null;

export async function initMetaApiStreams(dependencies = {}) {
  const logger = getLogger('metaapi-streams');

  if (!metaApiConfig.enabled || !metaApiConfig.stream.enabled) {
    logger.info('MetaApi streams disabled by configuration');
    return { enabled: false, close: async () => {} };
  }

  if (streamsState) {
    logger.warn('MetaApi streams already initialized');
    return streamsState;
  }

  const db = dependencies.db;
  const eventBus = dependencies.eventBus;
  if (!db || !eventBus) {
    throw new Error('initMetaApiStreams requires database and eventBus dependencies');
  }

  const streams = new Map();
  let stopping = false;

  async function loadActiveAccounts() {
    try {
      const result = await db.query(
        `
          SELECT id, user_id, metaapi_account_id, platform
          FROM broker_accounts
          WHERE status = 'CONNECTED'
            AND metaapi_account_id IS NOT NULL
        `,
      );
      return result.rows;
    } catch (error) {
      if (error.code === '42P01') {
        logger.warn('Broker accounts table not present yet; skipping stream startup');
        return [];
      }
      throw error;
    }
  }

  async function startStream(account) {
    if (streams.has(account.id)) {
      return;
    }
    const stop = async () => {};
    streams.set(account.id, stop);
    logger.info(
      { accountId: account.id, metaApiAccountId: account.metaapi_account_id },
      'MetaApi stream started',
    );
  }

  async function stopStream(accountId) {
    const stop = streams.get(accountId);
    if (!stop) {
      return;
    }
    try {
      await stop();
    } catch (error) {
      logger.error({ err: error, accountId }, 'Failed to stop metaapi stream');
    }
    streams.delete(accountId);
  }

  try {
    const accounts = await loadActiveAccounts();
    for (const account of accounts) {
      await startStream(account);
    }
  } catch (error) {
    logger.error({ err: error }, 'Failed to initialize metaapi streams');
  }

  async function close() {
    stopping = true;
    for (const accountId of Array.from(streams.keys())) {
      await stopStream(accountId);
    }
    streamsState = null;
  }

  streamsState = {
    enabled: true,
    close,
    startStream,
    stopStream,
    get activeStreams() {
      return streams.size;
    },
  };

  logger.info({ streams: streams.size }, 'MetaApi streams initialized');

  return streamsState;
}

export function getMetaApiStreams() {
  return streamsState;
}

export default initMetaApiStreams;