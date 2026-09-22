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

import http from 'node:http';

import { createApp } from './app.js';
import { logger } from './lib/logger.js';
import { initDatabase } from './bootstrap/initDatabase.js';
import { initMigrations } from './bootstrap/initMigrations.js';
import { initEventBus } from './bootstrap/initEventBus.js';
import { initJobScheduler } from './bootstrap/initJobScheduler.js';
import { initJobRunner } from './bootstrap/initJobRunner.js';
import { initWebSocket } from './bootstrap/initWebSocket.js';
import { initSolanaConnection } from './bootstrap/initSolanaConnection.js';
import { initSolanaIndexer } from './bootstrap/initSolanaIndexer.js';
import { initTelegramListeners } from './bootstrap/initTelegramListeners.js';
import { initDiscordListeners } from './bootstrap/initDiscordListeners.js';
import { initWhatsAppListeners } from './bootstrap/initWhatsAppListeners.js';
import { initEmailListeners } from './bootstrap/initEmailListeners.js';
import { initMetaApiStreams } from './bootstrap/initMetaApiStreams.js';

export async function createServer() {
  const app = createApp();
  const httpServer = http.createServer(app);

  const subsystems = {};

  try {
    subsystems.database = await initDatabase();
    subsystems.migrations = await initMigrations();

    subsystems.eventBus = await initEventBus();
    subsystems.jobScheduler = await initJobScheduler();
    subsystems.jobRunner = await initJobRunner();

    subsystems.webSocket = await initWebSocket(httpServer);
    subsystems.solanaConnection = await initSolanaConnection();
    subsystems.solanaIndexer = await initSolanaIndexer();

    subsystems.telegramListeners = await initTelegramListeners();
    subsystems.discordListeners = await initDiscordListeners();
    subsystems.whatsAppListeners = await initWhatsAppListeners();
    subsystems.emailListeners = await initEmailListeners();
    subsystems.metaApiStreams = await initMetaApiStreams();

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