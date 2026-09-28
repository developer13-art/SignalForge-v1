/**
 * Session Service
 *
 * @module signalforge/server/modules/auth/services/session
 */

import crypto from 'node:crypto';

import jwtConfig from '../../../config/jwt.config.js';
import { SessionNotFoundError, SessionRevokedError } from '../auth.errors.js';

export class SessionService {
  constructor(repository) {
    this.repository = repository;
  }

  hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async createSession(userId, tokens, meta = {}) {
    const accessTokenHash = this.hashToken(tokens.accessToken);
    const refreshTokenHash = this.hashToken(tokens.refreshToken);

    const expiresAt = new Date(
      Date.now() + jwtConfig.refreshToken.maxAgeMs,
    );

    const session = await this.repository.createSession({
      userId,
      tokenHash: accessTokenHash,
      refreshTokenHash,
      ipAddress: meta.ipAddress || null,
      userAgent: meta.userAgent || null,
      deviceId: meta.deviceId || null,
      deviceType: meta.deviceType || 'UNKNOWN',
      deviceLabel: meta.deviceLabel || null,
      expiresAt,
    });

    return session;
  }

  async validateSession(sessionId) {
    const session = await this.repository.findSessionById(sessionId);
    if (!session) {
      throw new SessionNotFoundError();
    }
    if (session.revoked_at) {
      throw new SessionRevokedError();
    }
    if (new Date(session.expires_at).getTime() < Date.now()) {
      throw new SessionRevokedError('Session has expired');
    }
    return session;
  }

  async touchSession(sessionId) {
    await this.repository.touchSession(sessionId);
  }

  async revokeSession(sessionId, reason = 'user_logout') {
    await this.repository.revokeSession(sessionId);
    return { sessionId, reason };
  }

  async revokeAllSessions(userId, exceptSessionId = null, reason = 'revoke_all') {
    await this.repository.revokeAllUserSessions(userId, exceptSessionId);
    return { userId, reason, exceptSessionId };
  }

  async listSessions(userId) {
    return this.repository.listUserSessions(userId);
  }

  async cleanupExpired() {
    return this.repository.cleanupExpiredSessions();
  }
}

export default SessionService;