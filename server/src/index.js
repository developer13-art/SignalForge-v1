'use strict';

/**
 * SignalForge AI - Server Entry Point
 *
 * This is the top-level entry point for the SignalForge backend. It
 * orchestrates the boot sequence, starts the HTTP and WebSocket
 * servers, and installs graceful shutdown handlers.
 *
 * The .env file is loaded BEFORE any other module is required so that
 * every config module sees a populated process.env.
 *
 * @module signalforge/server/index
 */

const path = require('node:path');

// Load .env first, before any other module in the process requires
// a config file. This must stay at the top of the file.
require('dotenv').config({
  path: path.resolve(__dirname, '..', '.env'),
});

const { createServer } = require('./server.js');
const { logger } = require('./lib/logger.js');
const { loadEnv } = require('./bootstrap/loadEnv.js');
const { validateEnv } = require('./bootstrap/validateEnv.js');
const { installGracefulShutdown } = require('./bootstrap/gracefulShutdown.js');

async function main() {
  try {
    logger.info('SignalForge server starting');

    loadEnv();
    validateEnv();

    const { httpServer, shutdown } = await createServer();

    installGracefulShutdown(shutdown);

    const port = Number(process.env.APP_PORT) || 4000;
    const host = '0.0.0.0';

    await new Promise((resolve, reject) => {
      httpServer.once('error', reject);
      httpServer.listen(port, host, () => {
        httpServer.removeListener('error', reject);
        resolve();
      });
    });

    logger.info(
      {
        port,
        host,
        env: process.env.NODE_ENV,
        pid: process.pid,
      },
      'SignalForge server is listening',
    );
  } catch (error) {
    logger.fatal({ err: error }, 'Fatal error during server startup');
    process.exit(1);
  }
}

process.on('unhandledRejection', (reason) => {
  logger.error({ err: reason }, 'Unhandled promise rejection');
});

process.on('uncaughtException', (error) => {
  const message = (error && error.message) || '';
  const code = (error && error.code) || '';

  const transientCodes = ['ECONNRESET', 'ETIMEDOUT', 'EPIPE', 'ECONNREFUSED', 'ENOTFOUND'];
  const transientMessages = [
    'Connection terminated unexpectedly',
    'Connection terminated due to connection timeout',
    'Client has encountered a connection error',
    'Client was closed and is not queryable',
  ];

  const isTransient =
    transientCodes.includes(code) ||
    transientMessages.some((m) => message.includes(m));

  if (isTransient) {
    logger.warn({ err: error }, 'Transient connection error ignored');
    return;
  }

  logger.fatal({ err: error }, 'Uncaught exception');
  process.exit(1);
});

main();