/**
 * Logout Service
 *
 * @module signalforge/server/modules/auth/services/logout
 */

import { SessionService } from './session.service.js';
import { emitUserLoggedOut, emitSessionRevoked } from '../auth.events.js';

export class LogoutService {
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

export default LogoutService;