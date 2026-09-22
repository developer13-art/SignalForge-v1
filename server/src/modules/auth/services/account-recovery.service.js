/**
 * Account Recovery Service
 *
 * @module signalforge/server/modules/auth/services/account-recovery
 */

import crypto from 'node:crypto';

import { resetTokenService } from '../tokens/reset-token.service.js';
import { SessionService } from './session.service.js';
import { TOKEN_TYPES, AUTH_METHODS } from '../auth.constants.js';
import { InvalidTokenError } from '../auth.errors.js';

export class AccountRecoveryService {
  constructor(repository, notificationService = null) {
    this.repository = repository;
    this.notifications = notificationService;
    this.sessionService = new SessionService(repository);
  }

  async requestRecovery(emailInput) {
    const user = await this.repository.findUserByEmail(emailInput);
    if (!user) {
      return { requested: true };
    }

    const token = resetTokenService.generate();
    const tokenHash = resetTokenService.hash(token);
    const expiresAt = resetTokenService.getExpiry();

    await this.repository.createVerificationToken({
      userId: user.id,
      tokenType: TOKEN_TYPES.PASSWORD_RESET,
      tokenHash,
      target: user.email,
      expiresAt,
    });

    if (this.notifications) {
      await this.notifications.sendAccountRecoveryEmail(user.email, { token, expiresAt });
    }

    return { requested: true };
  }

  async completeRecovery(token, newPassword) {
    if (!token || typeof token !== 'string') {
      throw new InvalidTokenError('Recovery token is missing');
    }

    const tokenHash = resetTokenService.hash(token);
    const record = await this.repository.findVerificationToken(
      tokenHash,
      TOKEN_TYPES.PASSWORD_RESET,
    );

    if (!record) {
      throw new InvalidTokenError('Recovery token is invalid or has expired');
    }

    if (resetTokenService.isExpired(record.expires_at)) {
      throw new InvalidTokenError('Recovery token has expired');
    }

    const bcrypt = await import('bcrypt');
    const rounds = Number(process.env.HASH_SALT_ROUNDS) || 12;
    const passwordHash = await bcrypt.default.hash(newPassword, rounds);

    await this.repository.updatePassword(record.user_id, passwordHash);
    await this.repository.markVerificationTokenUsed(record.id);
    await this.repository.unlockUserAccount(record.user_id);
    await this.sessionService.revokeAllSessions(record.user_id, null, 'account_recovery');

    return { recovered: true, userId: record.user_id };
  }
}

export default AccountRecoveryService;