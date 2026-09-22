/**
 * Graceful Shutdown Installer
 *
 * Installs signal handlers that call a provided shutdown function.
 * This module is the public entry point used by `index.js`.
 *
 * @module signalforge/server/bootstrap/gracefulShutdown
 */

import { registerGracefulShutdown } from './registerGracefulShutdown.js';
import { getLogger } from './initLogger.js';

export function installGracefulShutdown(shutdown, options = {}) {
  const logger = getLogger('shutdown');

  const removeHandlers = registerGracefulShutdown(shutdown, options);

  process.on('beforeExit', (code) => {
    logger.debug({ code }, 'Process beforeExit');
  });

  process.on('exit', (code) => {
    if (code !== 0) {
      logger.error({ code }, 'Process exited with non-zero code');
    } else {
      logger.info({ code }, 'Process exited cleanly');
    }
  });

  return removeHandlers;
}

export default installGracefulShutdown;