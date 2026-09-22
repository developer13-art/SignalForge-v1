/**
 * JWT Strategy
 *
 * Verifies access tokens and loads the associated user record.
 *
 * @module signalforge/server/modules/auth/strategies/jwt
 */

import { accessTokenService } from '../tokens/access-token.service.js';
import { InvalidTokenError, TokenExpiredError } from '../auth.errors.js';

export class JwtStrategy {
  constructor(repository) {
    this.repository = repository;
  }

  async authenticate(token) {
    if (!token || typeof token !== 'string') {
      throw new InvalidTokenError('Token is missing');
    }

    let payload;
    try {
      payload = accessTokenService.verify(token);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new TokenExpiredError();
      }
      throw new InvalidTokenError('Token is invalid');
    }

    const userId = payload.sub || payload.userId;
    const user = await this.repository.findUserById(userId);

    if (!user) {
      throw new InvalidTokenError('User not found');
    }

    return { user, payload };
  }
}

export default JwtStrategy;