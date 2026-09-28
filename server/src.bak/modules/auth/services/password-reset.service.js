/**
 * Password Reset Service
 *
 * @module signalforge/server/modules/auth/services/password-reset
 */

import { normalizeEmail } from '@signalforge/shared/validators/email.validator';

import { resetTokenService } from '../tokens/reset-token.service.js';
import { LocalStrategy } from '../strategies/local.strategy.js';
import { SessionService } from './session.service.js';
import { TOKEN_TYPES } from '../auth.constants.js';
import { InvalidTokenError } from '../auth.errors.js';
import {
  emitPasswordResetRequested,
  emitPasswordResetCompleted,
} from '../auth.events.js';

export class PasswordResetService {
  constructor(repository, notificationService = null) {
    this.repository = repository;
    this.notifications = notificationService;
    this.localStrategy = new LocalStrategy(repository);
    this.sessionService = new SessionService(repository);
  }

  async requestReset(emailInput) {
    const email = normalizeEmail(emailInput);

    const user = await this.repository.findUserByEmail(email);

    if (!user) {
      return { requested: true };
    }

    await this.repository.deleteExpiredVerificationTokens(user.id, TOKEN_TYPES.PASSWORD_RESET);

    const token = resetTokenService.generate();
    const tokenHash = resetTokenService.hash(token);
    const expiresAt = resetTokenService.getExpiry();

    await this.repository.createVerificationToken({
      userId: user.id,
      tokenType: TOKEN_TYPES.PASSWORD_RESET,
      tokenHash,
      target: email,
      expiresAt,
    });

    if (this.notifications) {
      await this.notifications.sendPasswordResetEmail(email, { token, expiresAt });
    }

    await emitPasswordResetRequested(user.id);

    return { requested: true, expiresAt };
  }

  async completeReset(token, newPassword) {
    if (!token || typeof token !== 'string') {
      throw new InvalidTokenError('Reset token is missing');
    }

    const tokenHash = resetTokenService.hash(token);
    const record = await this.repository.findVerificationToken(
      tokenHash,
      TOKEN_TYPES.PASSWORD_RESET,
    );

    if (!record) {
      throw new InvalidTokenError('Reset token is invalid or has expired');
    }

    if (resetTokenService.isExpired(record.expires_at)) {
      throw new InvalidTokenError('Reset token has expired');
    }

    const passwordHash = await this.localStrategy.hashPassword(newPassword);

    await this.repository.updatePassword(record.user_id, passwordHash);
    await this.repository.markVerificationTokenUsed(record.id);

    await this.sessionService.revokeAllSessions(record.user_id, null, 'password_reset');

    await emitPasswordResetCompleted(record.user_id);

    return { reset: true, userId: record.user_id };
  }
}

export default PasswordResetService;