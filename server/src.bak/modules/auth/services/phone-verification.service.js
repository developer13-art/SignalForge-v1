/**
 * Phone Verification Service
 *
 * @module signalforge/server/modules/auth/services/phone-verification
 */

import { phoneTokenService } from '../tokens/phone-token.service.js';
import { TOKEN_TYPES, OTP_MAX_ATTEMPTS } from '../auth.constants.js';
import {
  InvalidOtpError,
  OtpExpiredError,
  OtpAttemptsExceededError,
} from '../auth.errors.js';
import {
  emitPhoneVerificationSent,
  emitPhoneVerified,
} from '../auth.events.js';

const attemptStore = new Map();

export class PhoneVerificationService {
  constructor(repository, notificationService = null) {
    this.repository = repository;
    this.notifications = notificationService;
  }

  getAttemptKey(userId) {
    return `phone:${userId}`;
  }

  async requestVerification(userId, phone) {
    await this.repository.deleteExpiredVerificationTokens(userId, TOKEN_TYPES.PHONE_VERIFICATION);

    const code = phoneTokenService.generateOtp();
    const codeHash = phoneTokenService.hash(code);
    const expiresAt = phoneTokenService.getExpiry();

    await this.repository.createVerificationToken({
      userId,
      tokenType: TOKEN_TYPES.PHONE_VERIFICATION,
      tokenHash: codeHash,
      target: phone,
      expiresAt,
    });

    attemptStore.set(this.getAttemptKey(userId), { attempts: 0 });

    if (this.notifications) {
      await this.notifications.sendSmsVerification(phone, { code, expiresAt });
    }

    await emitPhoneVerificationSent(userId, phone);

    return { sent: true, expiresAt };
  }

  async verify(userId, code) {
    const key = this.getAttemptKey(userId);
    const attempts = attemptStore.get(key) || { attempts: 0 };

    if (attempts.attempts >= OTP_MAX_ATTEMPTS) {
      throw new OtpAttemptsExceededError();
    }

    const codeHash = phoneTokenService.hash(code);
    const record = await this.repository.findVerificationToken(
      codeHash,
      TOKEN_TYPES.PHONE_VERIFICATION,
    );

    if (!record || record.user_id !== userId) {
      attempts.attempts += 1;
      attemptStore.set(key, attempts);
      throw new InvalidOtpError();
    }

    if (phoneTokenService.isExpired(record.expires_at)) {
      throw new OtpExpiredError();
    }

    await this.repository.markPhoneVerified(userId);
    await this.repository.markVerificationTokenUsed(record.id);
    attemptStore.delete(key);

    await emitPhoneVerified(userId);

    return { verified: true, userId };
  }
}

export default PhoneVerificationService;