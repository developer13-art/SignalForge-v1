/**
 * Refresh Strategy
 *
 * Verifies refresh tokens and loads the associated session and user
 * record.
 *
 * @module signalforge/server/modules/auth/strategies/refresh
 */

import { refreshTokenService } from '../tokens/refresh-token.service.js';
import { InvalidTokenError, SessionRevokedError, SessionNotFoundError } from '../auth.errors.js';

export class RefreshStrategy {
  constructor(repository) {
    this.repository = repository;
  }

  async authenticate(token) {
    if (!token || typeof token !== 'string') {
      throw new InvalidTokenError('Refresh token is missing');
    }

    const tokenHash = refreshTokenService.hash(token);
    const session = await this.repository.findSessionByRefreshTokenHash(tokenHash);

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

    return { user, session };
  }
}

export default RefreshStrategy;