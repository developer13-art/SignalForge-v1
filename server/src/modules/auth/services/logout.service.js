/**
 * Logout Service
 *
 * @module signalforge/server/modules/auth/services/logout
 */
const { SessionService } = require('./session.service.js');
const { emitUserLoggedOut, emitSessionRevoked } = require('../auth.events.js');
class LogoutService {
  constructor(repository) {
    this.repository = repository;
    this.sessionService = new SessionService(repository);
  }

  async logout(sessionId, userId, meta = {}) {
    if (sessionId) {
      await this.sessionService.revokeSession(sessionId, 'user_logout');
      await emitSessionRevoked(userId, sessionId, 'user_logout', meta);
    }

    await emitUserLoggedOut(userId, sessionId, meta);

    return { loggedOut: true };
  }

  async logoutAllDevices(userId, exceptSessionId = null, meta = {}) {
    await this.sessionService.revokeAllSessions(userId, exceptSessionId, 'user_logout_all');
    await emitUserLoggedOut(userId, exceptSessionId, meta);

    return { loggedOut: true, devicesRevoked: true };
  }
}
module.exports = LogoutService;
module.exports.LogoutService = LogoutService;
