/**
 * Password Change Service
 *
 * @module signalforge/server/modules/auth/services/password-change
 */

import bcrypt from 'bcrypt';

import { LocalStrategy } from '../strategies/local.strategy.js';
import { SessionService } from './session.service.js';
import { InvalidCredentialsError } from '../auth.errors.js';
import { emitPasswordChanged } from '../auth.events.js';

export class PasswordChangeService {
  constructor(repository) {
    this.repository = repository;
    this.localStrategy = new LocalStrategy(repository);
    this.sessionService = new SessionService(repository);
  }

  async changePassword(userId, currentPassword, newPassword, currentSessionId = null) {
    const user = await this.repository.findUserById(userId);
    if (!user || !user.password_hash) {
      throw new InvalidCredentialsError();
    }

    const valid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!valid) {
      throw new InvalidCredentialsError('Current password is incorrect');
    }

    const passwordHash = await this.localStrategy.hashPassword(newPassword);
    await this.repository.updatePassword(userId, passwordHash);

    await this.sessionService.revokeAllSessions(userId, currentSessionId, 'password_change');

    await emitPasswordChanged(userId);

    return { changed: true };
  }
}

export default PasswordChangeService;