/**
 * Refresh Token Service
 *
 * @module signalforge/server/modules/auth/services/refresh-token
 */

import crypto from 'node:crypto';

import jwtConfig from '../../../config/jwt.config.js';
import { accessTokenService } from '../tokens/access-token.service.js';
import { refreshTokenService as tokenGenerator } from '../tokens/refresh-token.service.js';
import { SessionService } from './session.service.js';
import {
  InvalidTokenError,
  SessionNotFoundError,
  SessionRevokedError,
} from '../auth.errors.js';

export class RefreshTokenService {
  constructor(repository) {
    this.repository = repository;
    this.sessionService = new SessionService(repository);
  }

  hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async rotate(currentRefreshToken, req) {
    if (!currentRefreshToken || typeof currentRefreshToken !== 'string') {
      throw new InvalidTokenError('Refresh token is missing');
    }

    const currentHash = this.hashToken(currentRefreshToken);
    const session = await this.repository.findSessionByRefreshTokenHash(currentHash);

    if (!session) {
      throw new SessionNotFoundError();
    }

    if (session.revoked_at) {
      throw new SessionRevokedError();
    }

    if (new Date(session.expires_at).getTime() < Date.now()) {
      throw new InvalidTokenError('Refresh token has expired');
    }

    const user = await this.repository.findUserById(session.user_id);
    if (!user) {
      throw new InvalidTokenError('User not found');
    }

    if (user.status !== 'ACTIVE') {
      await this.sessionService.revokeSession(session.id, 'account_not_active');
      throw new InvalidTokenError('Account is not active');
    }

    const roles = await this.repository.getUserRoles(user.id);
    const permissions = await this.repository.getUserPermissions(user.id);

    const newRefreshToken = tokenGenerator.generate();
    const newRefreshHash = this.hashToken(newRefreshToken);

    const newExpiresAt = new Date(Date.now() + jwtConfig.refreshToken.maxAgeMs);

    const accessToken = accessTokenService.sign({
      sub: user.id,
      userId: user.id,
      email: user.email,
      role: roles[0] || null,
      roles,
      permissions,
      sessionId: session.id,
      kycStatus: user.kyc_status,
      accountStatus: user.status,
      emailVerified: Boolean(user.email_verified_at),
      phoneVerified: Boolean(user.phone_verified_at),
    });

    await this.repository.revokeSession(session.id);

    const newSession = await this.repository.createSession({
      userId: user.id,
      tokenHash: this.hashToken(accessToken),
      refreshTokenHash: newRefreshHash,
      ipAddress: req.ip || null,
      userAgent: req.headers['user-agent'] || null,
      deviceId: session.device_id,
      deviceType: session.device_type,
      deviceLabel: session.device_label,
      expiresAt: newExpiresAt,
    });

    await this.repository.touchSession(newSession.id);

    return {
      accessToken,
      refreshToken: newRefreshToken,
      sessionId: newSession.id,
      expiresAt: newExpiresAt,
    };
  }
}

export default RefreshTokenService;