/**
 * Graceful Shutdown Installer
 *
 * Installs signal handlers that call a provided shutdown function.
 * This module is the public entry point used by `index.js`.
 *
 * @module signalforge/server/bootstrap/gracefulShutdown
 */
const { registerGracefulShutdown } = require('./registerGracefulShutdown.js');
const { getLogger } = require('./initLogger.js');
function installGracefulShutdown(shutdown, options = {}) {
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
module.exports = installGracefulShutdown;
module.exports.installGracefulShutdown = installGracefulShutdown;
