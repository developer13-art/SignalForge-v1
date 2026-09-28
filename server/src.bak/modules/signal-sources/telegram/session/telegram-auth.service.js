/**
 * Telegram Auth Service
 *
 * Orchestrates the User Session login flow: phone number submission,
 * OTP verification, and optional 2-step password.
 *
 * @module signalforge/server/modules/signal-sources/telegram/auth
 */

import { TelegramOtpService } from './telegram-otp.service.js';
import { TelegramClientFactory } from './telegram-client.factory.js';
import { TelegramSessionStoreService } from './telegram-session-store.service.js';
import { TelegramRepository } from './telegram.repository.js';
import { TELEGRAM_LOGIN_STATES } from './telegram.constants.js';
import { getLogger } from '../../../bootstrap/initLogger.js';
import { SourceConnectionError, SourceNotConfiguredError } from '../source.errors.js';

export class TelegramAuthService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new TelegramRepository();
    this.sessionStore = dependencies.sessionStore || new TelegramSessionStoreService(this.repository);
    this.otp = dependencies.otp || new TelegramOtpService();
    this.logger = getLogger('telegram-auth');
  }

  async startLogin(userId, phoneNumber, country = null) {
    if (!TelegramClientFactory.isConfigured()) {
      throw new SourceNotConfiguredError('Telegram integration is not configured');
    }

    const { sessionId, expiresAt } = this.otp.createLoginSession(userId);
    this.otp.attachPhoneNumber(sessionId, phoneNumber);

    let client;
    try {
      client = TelegramClientFactory.create({ phoneNumber });
      const sendResult = await client.sendCode(phoneNumber);

      this.otp.attachCodeHash(sessionId, sendResult?.phoneCodeHash || null);

      return {
        sessionId,
        phoneNumber,
        country,
        expiresAt,
        state: TELEGRAM_LOGIN_STATES.AWAITING_OTP,
        phoneCodeHash: sendResult?.phoneCodeHash || null,
      };
    } catch (error) {
      this.otp.cancelLogin(sessionId);
      throw new SourceConnectionError('Failed to send Telegram code', {
        cause: error.message,
      });
    }
  }

  async verifyOtp(sessionId, otp, options = {}) {
    const pending = this.otp.getSession(sessionId);
    if (!pending) {
      throw new SourceConnectionError('Telegram login session not found');
    }

    const validation = this.otp.verifyOtp(sessionId, otp);
    if (!validation.valid) {
      throw new SourceConnectionError(`OTP verification failed: ${validation.reason}`);
    }

    let client;
    try {
      client = TelegramClientFactory.create({
        phoneNumber: pending.phoneNumber,
      });

      const signInResult = await client.signIn({
        phoneNumber: pending.phoneNumber,
        phoneCode: otp,
        phoneCodeHash: pending.codeHash,
      });

      if (signInResult?.requires2FA) {
        this.otp.markAwaiting2fa(sessionId);
        return {
          state: TELEGRAM_LOGIN_STATES.AWAITING_PASSWORD,
          sessionId,
        };
      }

      const sessionString = await client.saveSession();
      return this.finishLogin(pending.userId, sessionId, sessionString, options);
    } catch (error) {
      throw new SourceConnectionError('Telegram sign-in failed', {
        cause: error.message,
      });
    }
  }

  async verifyPassword(sessionId, password, options = {}) {
    const pending = this.otp.getSession(sessionId);
    if (!pending) {
      throw new SourceConnectionError('Telegram login session not found');
    }

    let client;
    try {
      client = TelegramClientFactory.create({
        phoneNumber: pending.phoneNumber,
      });
      await client.checkPassword(password);
      const sessionString = await client.saveSession();
      return this.finishLogin(pending.userId, sessionId, sessionString, options);
    } catch (error) {
      throw new SourceConnectionError('Telegram 2-step verification failed', {
        cause: error.message,
      });
    }
  }

  async finishLogin(userId, sessionId, sessionString, options = {}) {
    let connection = await this.repository.findConnectionByUser(userId);
    if (!connection) {
      connection = await this.repository.createConnection({
        userId,
        phoneNumber: this.otp.getSession(sessionId)?.phoneNumber || null,
        country: options.country || null,
        sessionEncrypted: null,
        status: 'CONNECTED',
      });
    }

    await this.sessionStore.storeSession(connection.id, sessionString);
    this.otp.completeLogin(sessionId);

    return {
      state: TELEGRAM_LOGIN_STATES.AUTHENTICATED,
      connectionId: connection.id,
    };
  }

  async logout(userId) {
    const connection = await this.repository.findConnectionByUser(userId);
    if (!connection) {
      return { loggedOut: false };
    }
    await this.sessionStore.markRevoked(connection.id);
    return { loggedOut: true };
  }
}

export default TelegramAuthService;