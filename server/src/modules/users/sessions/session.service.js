/**
 * Session Service (User Module)
 *
 * @module signalforge/server/modules/users/sessions/service
 */
const { SessionRepository } = require('./session.repository.js');
const { emitSessionRevoked } = require('../user.events.js');
const { NotFoundError } = require('../../../lib/errors/not-found-error.js');
class SessionService {
  constructor(repository = null) {
    this.repository = repository || new SessionRepository();
  }

  async list(userId) {
    const sessions = await this.repository.listByUser(userId);
    return sessions.map((s) => this.serialize(s));
  }

  async revoke(sessionId, userId, reason = 'user_action') {
    const existing = await this.repository.findById(sessionId, userId);
    if (!existing) {
      throw new NotFoundError('Session not found', { code: 'SESSION_NOT_FOUND' });
    }

    const revoked = await this.repository.revoke(sessionId, userId, reason);
    if (revoked) {
      await emitSessionRevoked(userId, sessionId, reason);
    }

    return { revoked, sessionId };
  }

  async revokeAll(userId, exceptSessionId = null, reason = 'user_action') {
    const count = await this.repository.revokeAll(userId, exceptSessionId, reason);
    return { revoked: true, count };
  }

  serialize(row) {
    return {
      id: row.id,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      deviceId: row.device_id,
      deviceType: row.device_type,
      deviceLabel: row.device_label,
      expiresAt: row.expires_at,
      createdAt: row.created_at,
      lastUsedAt: row.last_used_at,
    };
  }
}
module.exports = SessionService;
module.exports.SessionService = SessionService;
