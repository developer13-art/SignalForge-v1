/**
 * Graceful Shutdown Registration
 *
 * Registers signal handlers for SIGTERM, SIGINT, and SIGHUP so that
 * the process can shut down cleanly. The actual shutdown function is
 * provided by the caller (typically `server.js`).
 *
 * @module signalforge/server/bootstrap/registerGracefulShutdown
 */

import appConfig from '../config/app.config.js';
import { getLogger } from './initLogger.js';

export function registerGracefulShutdown(shutdown, options = {}) {
  const logger = getLogger('shutdown');
  const timeoutMs = options.timeoutMs || appConfig.shutdownTimeoutMs;
  let shuttingDown = false;

  async function handleSignal(signal) {
    if (shuttingDown) {
      logger.warn({ signal }, 'Shutdown already in progress; ignoring signal');
      return;
    }
    shuttingDown = true;

    logger.info({ signal }, 'Received shutdown signal');

    const timeout = setTimeout(() => {
      logger.fatal({ signal, timeoutMs }, 'Graceful shutdown timed out; forcing exit');
      process.exit(1);
    }, timeoutMs);

    if (timeout.unref) {
      timeout.unref();
    }

    try {
      await shutdown(signal);
      clearTimeout(timeout);
      logger.info({ signal }, 'Graceful shutdown finished');
      process.exit(0);
    } catch (error) {
      clearTimeout(timeout);
      logger.fatal({ err: error, signal }, 'Error during graceful shutdown');
      process.exit(1);
    }
  }

  process.on('SIGTERM', () => handleSignal('SIGTERM'));
  process.on('SIGINT', () => handleSignal('SIGINT'));
  process.on('SIGHUP', () => handleSignal('SIGHUP'));

  return () => {
    process.removeAllListeners('SIGTERM');
    process.removeAllListeners('SIGINT');
    process.removeAllListeners('SIGHUP');
  };
}

export default registerGracefulShutdown;