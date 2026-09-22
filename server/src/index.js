/**
 * SignalForge AI - Server Entry Point
 *
 * This is the top-level entry point for the SignalForge backend. It
 * orchestrates the boot sequence, starts the HTTP and WebSocket
 * servers, and installs graceful shutdown handlers.
 *
 * The actual server application is composed in `app.js`. The HTTP
 * server lifecycle is managed in `server.js`.
 *
 * @module signalforge/server/index
 */

import { createServer } from './server.js';
import { logger } from './lib/logger.js';
import { loadEnv } from './bootstrap/loadEnv.js';
import { validateEnv } from './bootstrap/validateEnv.js';
import { installGracefulShutdown } from './bootstrap/gracefulShutdown.js';

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
  logger.fatal({ err: error }, 'Uncaught exception');
  process.exit(1);
});

main();