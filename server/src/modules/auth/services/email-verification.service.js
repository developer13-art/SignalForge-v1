/**
 * Email Verification Service
 *
 * @module signalforge/server/modules/auth/services/email-verification
 */

import { emailTokenService } from '../tokens/email-token.service.js';
import { TOKEN_TYPES } from '../auth.constants.js';
import { InvalidTokenError } from '../auth.errors.js';
import {
  emitEmailVerificationSent,
  emitEmailVerified,
} from '../auth.events.js';

export class EmailVerificationService {
  constructor(repository, notificationService = null) {
    this.repository = repository;
    this.notifications = notificationService;
  }

  async requestVerification(userId, email) {
    await this.repository.deleteExpiredVerificationTokens(userId, TOKEN_TYPES.EMAIL_VERIFICATION);

    const token = emailTokenService.generate();
    const tokenHash = emailTokenService.hash(token);
    const expiresAt = emailTokenService.getExpiry();

    await this.repository.createVerificationToken({
      userId,
      tokenType: TOKEN_TYPES.EMAIL_VERIFICATION,
      tokenHash,
      target: email,
      expiresAt,
    });

    if (this.notifications) {
      await this.notifications.sendEmailVerification(email, { token, expiresAt });
    }

    await emitEmailVerificationSent(userId, email);

    return { sent: true, expiresAt };
  }

  async verify(token) {
    if (!token || typeof token !== 'string') {
      throw new InvalidTokenError('Verification token is missing');
    }

    const tokenHash = emailTokenService.hash(token);
    const record = await this.repository.findVerificationToken(
      tokenHash,
      TOKEN_TYPES.EMAIL_VERIFICATION,
    );

    if (!record) {
      throw new InvalidTokenError('Verification token is invalid or has expired');
    }

    if (emailTokenService.isExpired(record.expires_at)) {
      throw new InvalidTokenError('Verification token has expired');
    }

    await this.repository.markEmailVerified(record.user_id);
    await this.repository.markVerificationTokenUsed(record.id);

    await emitEmailVerified(record.user_id);

    return { verified: true, userId: record.user_id };
  }
}

export default EmailVerificationService;