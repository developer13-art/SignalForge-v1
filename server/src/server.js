'use strict';

/**
 * SignalForge AI - HTTP and WebSocket Server
 *
 * Creates the underlying HTTP server that hosts the Express
 * application and the WebSocket server used for real-time updates.
 * Also initializes the database, event bus, job scheduler, and
 * external service listeners, and returns a shutdown function for
 * graceful termination.
 *
 * @module signalforge/server/server
 */

const http = require('node:http');

const { createApp } = require('./app.js');
const { logger } = require('./lib/logger.js');
const { initDatabase } = require('./bootstrap/initDatabase.js');
const { initMigrations } = require('./bootstrap/initMigrations.js');
const { initEventBus } = require('./bootstrap/initEventBus.js');
const { initJobScheduler } = require('./bootstrap/initJobScheduler.js');
const { initJobRunner } = require('./bootstrap/initJobRunner.js');
const { initWebSocket } = require('./bootstrap/initWebSocket.js');
const { initSolanaConnection } = require('./bootstrap/initSolanaConnection.js');
const { initSolanaIndexer } = require('./bootstrap/initSolanaIndexer.js');
const { initTelegramListeners } = require('./bootstrap/initTelegramListeners.js');
const { initDiscordListeners } = require('./bootstrap/initDiscordListeners.js');
const { initWhatsAppListeners } = require('./bootstrap/initWhatsAppListeners.js');
const { initEmailListeners } = require('./bootstrap/initEmailListeners.js');
const { initMetaApiStreams } = require('./bootstrap/initMetaApiStreams.js');

async function createServer() {
  const app = createApp();
  const httpServer = http.createServer(app);

  const subsystems = {};

  try {
    // Database first: everything downstream depends on it.
    subsystems.database = await initDatabase();

    // Database-dependent subsystems.
    subsystems.migrations = await initMigrations({ db: subsystems.database });
    subsystems.eventBus = await initEventBus({ db: subsystems.database });
    subsystems.jobScheduler = await initJobScheduler({ db: subsystems.database });
    subsystems.jobRunner = await initJobRunner({ db: subsystems.database });

    // Real-time and Solana subsystems.
    subsystems.webSocket = await initWebSocket(httpServer);
    subsystems.solanaConnection = await initSolanaConnection();
    subsystems.solanaIndexer = await initSolanaIndexer();

    // External source listeners. Each listener initializer reads the
    // database and the event bus from its dependency object.
    const listenerDeps = {
      db: subsystems.database,
      eventBus: subsystems.eventBus,
    };

    subsystems.telegramListeners = await initTelegramListeners(listenerDeps);
    subsystems.discordListeners = await initDiscordListeners(listenerDeps);
    subsystems.whatsAppListeners = await initWhatsAppListeners(listenerDeps);
    subsystems.emailListeners = await initEmailListeners(listenerDeps);
    subsystems.metaApiStreams = await initMetaApiStreams(listenerDeps);

    logger.info('All subsystems initialized');
  } catch (error) {
    logger.fatal({ err: error }, 'Failed to initialize subsystems');
    throw error;
  }

  let shuttingDown = false;

  async function shutdown(signal = 'SIGTERM') {
    if (shuttingDown) {
      logger.warn({ signal }, 'Shutdown already in progress');
      return;
    }
    shuttingDown = true;

    logger.info({ signal }, 'Initiating graceful shutdown');

    await safeClose('metaApiStreams', subsystems.metaApiStreams);
    await safeClose('emailListeners', subsystems.emailListeners);
    await safeClose('whatsAppListeners', subsystems.whatsAppListeners);
    await safeClose('discordListeners', subsystems.discordListeners);
    await safeClose('telegramListeners', subsystems.telegramListeners);
    await safeClose('solanaIndexer', subsystems.solanaIndexer);
    await safeClose('solanaConnection', subsystems.solanaConnection);
    await safeClose('webSocket', subsystems.webSocket);
    await safeClose('jobRunner', subsystems.jobRunner);
    await safeClose('jobScheduler', subsystems.jobScheduler);
    await safeClose('eventBus', subsystems.eventBus);

    await new Promise((resolve) => {
      httpServer.close(() => {
        logger.info('HTTP server closed');
        resolve();
      });
    });

    await safeClose('migrations', subsystems.migrations);
    await safeClose('database', subsystems.database);

    logger.info('Graceful shutdown complete');
  }

  httpServer.on('error', (error) => {
    logger.error({ err: error }, 'HTTP server error');
  });

  return { app, httpServer, shutdown, subsystems };
}

async function safeClose(name, subsystem) {
  if (!subsystem || typeof subsystem.close !== 'function') {
    return;
  }
  try {
    await subsystem.close();
    logger.debug({ subsystem: name }, 'Subsystem closed');
  } catch (error) {
    logger.error({ err: error, subsystem: name }, 'Failed to close subsystem');
  }
}

module.exports = {
  createServer,
  safeClose,
};