/**
 * Session Service (User Module)
 *
 * @module signalforge/server/modules/users/sessions/service
 */

import { SessionRepository } from './session.repository.js';
import { emitSessionRevoked } from '../user.events.js';
import { NotFoundError } from '../../../lib/errors/not-found-error.js';

export class SessionService {
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

export default SessionService;