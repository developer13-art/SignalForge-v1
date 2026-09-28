/**
 * Auth Service (facade)
 *
 * @module signalforge/server/modules/auth/service
 */
const { AuthRepository } = require('./auth.repository.js');
const { RegisterService } = require('./services/register.service.js');
const { LoginService } = require('./services/login.service.js');
const { LogoutService } = require('./services/logout.service.js');
const { RefreshTokenService } = require('./services/refresh-token.service.js');
const { PasswordResetService } = require('./services/password-reset.service.js');
const { PasswordChangeService } = require('./services/password-change.service.js');
const { EmailVerificationService } = require('./services/email-verification.service.js');
const { PhoneVerificationService } = require('./services/phone-verification.service.js');
const { TwoFactorService } = require('./services/two-factor.service.js');
const { SessionService } = require('./services/session.service.js');
const { DeviceService } = require('./services/device.service.js');
const { AccountRecoveryService } = require('./services/account-recovery.service.js');
const { SocialLoginService } = require('./services/social-login.service.js');
class AuthService {
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
module.exports = AuthService;
module.exports.AuthService = AuthService;
