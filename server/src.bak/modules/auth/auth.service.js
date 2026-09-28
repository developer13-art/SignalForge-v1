/**
 * Auth Service (facade)
 *
 * @module signalforge/server/modules/auth/service
 */

import { AuthRepository } from './auth.repository.js';
import { RegisterService } from './services/register.service.js';
import { LoginService } from './services/login.service.js';
import { LogoutService } from './services/logout.service.js';
import { RefreshTokenService } from './services/refresh-token.service.js';
import { PasswordResetService } from './services/password-reset.service.js';
import { PasswordChangeService } from './services/password-change.service.js';
import { EmailVerificationService } from './services/email-verification.service.js';
import { PhoneVerificationService } from './services/phone-verification.service.js';
import { TwoFactorService } from './services/two-factor.service.js';
import { SessionService } from './services/session.service.js';
import { DeviceService } from './services/device.service.js';
import { AccountRecoveryService } from './services/account-recovery.service.js';
import { SocialLoginService } from './services/social-login.service.js';

export class AuthService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new AuthRepository();

    this.emailVerification = new EmailVerificationService(
      this.repository,
      dependencies.notificationService || null,
    );
    this.phoneVerification = new PhoneVerificationService(
      this.repository,
      dependencies.notificationService || null,
    );

    this.registerService = new RegisterService(
      this.repository,
      this.emailVerification,
    );
    this.loginService = new LoginService(this.repository);
    this.logoutService = new LogoutService(this.repository);
    this.refreshTokenService = new RefreshTokenService(this.repository);
    this.passwordResetService = new PasswordResetService(
      this.repository,
      dependencies.notificationService || null,
    );
    this.passwordChangeService = new PasswordChangeService(this.repository);
    this.twoFactorService = new TwoFactorService(this.repository);
    this.sessionService = new SessionService(this.repository);
    this.deviceService = new DeviceService(this.repository);
    this.accountRecoveryService = new AccountRecoveryService(
      this.repository,
      dependencies.notificationService || null,
    );
    this.socialLoginService = new SocialLoginService(
      this.repository,
      dependencies,
    );
  }

  async register(payload, meta) {
    return this.registerService.register(payload, meta);
  }

  async login(email, password, req) {
    return this.loginService.login(email, password, req);
  }

  async verifyTwoFactor(challengeToken, code, req) {
    return this.loginService.verifyTwoFactor(challengeToken, code, req);
  }

  async logout(sessionId, userId, meta) {
    return this.logoutService.logout(sessionId, userId, meta);
  }

  async logoutAllDevices(userId, exceptSessionId, meta) {
    return this.logoutService.logoutAllDevices(userId, exceptSessionId, meta);
  }

  async refresh(currentRefreshToken, req) {
    return this.refreshTokenService.rotate(currentRefreshToken, req);
  }

  async requestPasswordReset(email) {
    return this.passwordResetService.requestReset(email);
  }

  async completePasswordReset(token, newPassword) {
    return this.passwordResetService.completeReset(token, newPassword);
  }

  async changePassword(userId, currentPassword, newPassword, sessionId) {
    return this.passwordChangeService.changePassword(
      userId,
      currentPassword,
      newPassword,
      sessionId,
    );
  }

  async requestEmailVerification(userId, email) {
    return this.emailVerification.requestVerification(userId, email);
  }

  async verifyEmail(token) {
    return this.emailVerification.verify(token);
  }

  async requestPhoneVerification(userId, phone) {
    return this.phoneVerification.requestVerification(userId, phone);
  }

  async verifyPhone(userId, code) {
    return this.phoneVerification.verify(userId, code);
  }

  async startTwoFactorSetup(userId, userEmail, method) {
    return this.twoFactorService.startSetup(userId, userEmail, method);
  }

  async confirmTwoFactorSetup(userId, code) {
    return this.twoFactorService.confirmSetup(userId, code);
  }

  async disableTwoFactor(userId, password, code) {
    return this.twoFactorService.disable(userId, password, code);
  }

  async getTwoFactorStatus(userId) {
    return this.twoFactorService.getStatus(userId);
  }

  async regenerateBackupCodes(userId, code) {
    return this.twoFactorService.regenerateBackupCodes(userId, code);
  }

  async listSessions(userId) {
    return this.sessionService.listSessions(userId);
  }

  async revokeSession(sessionId, userId, reason) {
    return this.sessionService.revokeSession(sessionId, reason);
  }

  async listDevices(userId) {
    return this.deviceService.listUserDevices(userId);
  }

  async requestAccountRecovery(email) {
    return this.accountRecoveryService.requestRecovery(email);
  }

  async completeAccountRecovery(token, newPassword) {
    return this.accountRecoveryService.completeRecovery(token, newPassword);
  }

  async socialLogin(provider, token, req) {
    return this.socialLoginService.authenticate(provider, token, req);
  }
}

export default AuthService;