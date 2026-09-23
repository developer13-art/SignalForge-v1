/**
 * Telegram OTP Service
 *
 * Manages OTP codes used during Telegram User Session login.
 *
 * @module signalforge/server/modules/signal-sources/telegram/otp
 */

import crypto from 'node:crypto';

import { OTP_EXPIRY_MINUTES, MAX_OTP_ATTEMPTS } from './telegram.constants.js';
import { getLogger } from '../../../bootstrap/initLogger.js';

const pendingLogins = new Map();

export class TelegramOtpService {
  constructor() {
    this.logger = getLogger('telegram-otp');
  }

  generateOtp() {
    return crypto.randomInt(100000, 999999).toString();
  }

  createLoginSession(userId) {
    const sessionId = crypto.randomUUID();
    const otp = this.generateOtp();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    pendingLogins.set(sessionId, {
      userId,
      otp,
      expiresAt,
      attempts: 0,
      createdAt: new Date(),
      phoneNumber: null,
      step: 'AWAITING_PHONE',
    });

    return { sessionId, expiresAt };
  }

  attachPhoneNumber(sessionId, phoneNumber) {
    const pending = pendingLogins.get(sessionId);
    if (!pending) {
      throw new Error('Login session not found');
    }
    pending.phoneNumber = phoneNumber;
    pending.step = 'AWAITING_OTP';
  }

  attachCodeHash(sessionId, codeHash) {
    const pending = pendingLogins.get(sessionId);
    if (!pending) {
      throw new Error('Login session not found');
    }
    pending.codeHash = codeHash;
  }

  verifyOtp(sessionId, otp) {
    const pending = pendingLogins.get(sessionId);
    if (!pending) {
      return { valid: false, reason: 'SESSION_NOT_FOUND' };
    }
    if (pending.expiresAt.getTime() < Date.now()) {
      pendingLogins.delete(sessionId);
      return { valid: false, reason: 'EXPIRED' };
    }
    if (pending.attempts >= MAX_OTP_ATTEMPTS) {
      pendingLogins.delete(sessionId);
      return { valid: false, reason: 'ATTEMPTS_EXCEEDED' };
    }
    pending.attempts++;

    if (pending.codeHash) {
      const providedHash = crypto.createHash('sha256').update(String(otp)).digest('hex');
      if (providedHash !== pending.codeHash) {
        return { valid: false, reason: 'INVALID' };
      }
    } else if (pending.otp && String(otp) !== pending.otp) {
      return { valid: false, reason: 'INVALID' };
    }

    return { valid: true };
  }

  markAwaiting2fa(sessionId) {
    const pending = pendingLogins.get(sessionId);
    if (!pending) {
      return;
    }
    pending.step = 'AWAITING_PASSWORD';
  }

  completeLogin(sessionId) {
    const pending = pendingLogins.get(sessionId);
    if (!pending) {
      return null;
    }
    pendingLogins.delete(sessionId);
    return pending;
  }

  cancelLogin(sessionId) {
    pendingLogins.delete(sessionId);
  }

  cleanupExpired() {
    const now = Date.now();
    for (const [sessionId, session] of pendingLogins) {
      if (session.expiresAt.getTime() < now) {
        pendingLogins.delete(sessionId);
      }
    }
  }

  getSession(sessionId) {
    return pendingLogins.get(sessionId) || null;
  }
}

export default TelegramOtpService;