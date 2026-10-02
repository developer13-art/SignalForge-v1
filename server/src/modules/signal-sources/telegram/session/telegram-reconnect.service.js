/**
 * Telegram Reconnect Service
 *
 * Periodically verifies Telegram sessions and reconnects any listener
 * that has dropped. Also detects expired sessions and marks them.
 *
 * @module signalforge/server/modules/signal-sources/telegram/reconnect
 */
const { getLogger } = require('../../../bootstrap/initLogger.js');
const { TelegramRepository } = require('../telegram.repository.js');
const { TelegramSessionStoreService } = require('../telegram-session-store.service.js');
const { TelegramListenerService } = require('./telegram-listener.service.js');
const { SESSION_HEALTH_CHECK_INTERVAL_MS } = require('./telegram.constants.js');
class TelegramReconnectService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new TelegramRepository();
    this.sessionStore = dependencies.sessionStore || new TelegramSessionStoreService(this.repository);
    this.listenerService = dependencies.listenerService || new TelegramListenerService();
    this.logger = getLogger('telegram-reconnect');
    this.intervalHandle = null;
  }

  async runCycle() {
    const connections = await this.repository.listActiveConnections();
    for (const connection of connections) {
      try {
        await this.listenerService.start(connection.user_id);
      } catch (error) {
        this.logger.error(
          { err: error, connectionId: connection.id },
          'Failed to start listener during reconnect cycle',
        );
        await this.sessionStore.markExpired(connection.id, error.message);
      }
    }
  }

  start() {
    if (this.intervalHandle) {
      return;
    }
    this.intervalHandle = setInterval(
      () => this.runCycle().catch((err) => this.logger.error({ err }, 'Reconnect cycle failed')),
      SESSION_HEALTH_CHECK_INTERVAL_MS,
    );
    if (this.intervalHandle.unref) {
      this.intervalHandle.unref();
    }
  }

  async stop() {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }
    await this.listenerService.stopAll();
  }
}
module.exports = TelegramReconnectService;
module.exports.TelegramReconnectService = TelegramReconnectService;
