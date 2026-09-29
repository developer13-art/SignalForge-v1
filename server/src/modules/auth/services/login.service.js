/**
 * Login Service
 *
 * @module signalforge/server/modules/auth/services/login
 */
const { normalizeEmail } = require('@signalforge/shared/validators/email.validator');
const { LocalStrategy } = require('../strategies/local.strategy.js');
const { SessionService } = require('./session.service.js');
const { DeviceService } = require('./device.service.js');
const { accessTokenService } = require('../tokens/access-token.service.js');
const { refreshTokenService } = require('../tokens/refresh-token.service.js');
const {
  InvalidCredentialsError,
  AccountLockedError,
  AccountNotActiveError,
  TwoFactorRequiredError,
} = require('../auth.errors.js');
const {
  MAX_FAILED_LOGIN_ATTEMPTS,
  FAILED_LOGIN_WINDOW_MINUTES,
} = require('../auth.constants.js');
const {
  emitUserLoggedIn,
  emitLoginFailed,
  emitTwoFactorChallenge,
} = require('../auth.events.js');

class LoginService {
  constructor(repository) {
    this.repository = repository;
    this.localStrategy = new LocalStrategy(repository);
    this.sessionService = new SessionService(repository);
    this.deviceService = new DeviceService(repository);
  }

  buildAccessTokenPayload(user, roles, permissions, sessionId) {
    return {
      sub: user.id,
      userId: user.id,
      email: user.email,
      role: roles[0] || null,
      roles,
      permissions,
      sessionId,
      kycStatus: user.kyc_status,
      accountStatus: user.status,
      emailVerified: Boolean(user.email_verified_at),
      phoneVerified: Boolean(user.phone_verified_at),
    };
  }

  async login(emailInput, password, req) {
    const email = normalizeEmail(emailInput);

    const recentFailures = await this.repository.countRecentFailedAttempts(
      email,
      FAILED_LOGIN_WINDOW_MINUTES,
    );

    if (recentFailures >= MAX_FAILED_LOGIN_ATTEMPTS) {
      await emitLoginFailed(email, 'too_many_attempts', {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });
      throw new AccountLockedError();
    }

    let user;
    try {
      user = await this.localStrategy.authenticate(email, password);
    } catch (error) {
      await this.repository.logLoginAttempt({
        email,
        success: false,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        reason: 'invalid_credentials',
      });

      if (error instanceof InvalidCredentialsError) {
        throw error;
      }
      throw new InvalidCredentialsError();
    }

    if (user.locked_until && new Date(user.locked_until).getTime() > Date.now()) {
      await this.repository.logLoginAttempt({
        userId: user.id,
        email,
        success: false,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        reason: 'account_locked',
      });
      throw new AccountLockedError('Account is locked', {
        lockedUntil: user.locked_until,
      });
    }

    if (user.status !== 'ACTIVE') {
      throw new AccountNotActiveError('Account is not active', {
        status: user.status,
      });
    }

    const twoFactor = await this.repository.findTwoFactorByUserId(user.id);
    if (twoFactor && twoFactor.enabled === true) {
      const challengeToken = accessTokenService.sign(
        { sub: user.id, purpose: '2fa_challenge' },
        { expiresIn: '5m' },
      );

      await emitTwoFactorChallenge(user.id, null, {
        ipAddress: req.ip,
      });

      throw new TwoFactorRequiredError('Two-factor authentication required', {
        method: twoFactor.method,
        challengeToken,
      });
    }

    return this.completeLogin(user, req);
  }

  async completeLogin(user, req) {
    const roles = await this.repository.getUserRoles(user.id);
    const permissions = await this.repository.getUserPermissions(user.id);

    const temporaryAccessToken = accessTokenService.sign(
      this.buildAccessTokenPayload(user, roles, permissions, null),
    );

    const refreshToken = refreshTokenService.generate();

    const session = await this.sessionService.createSession(
      user.id,
      {
        accessToken: temporaryAccessToken,
        refreshToken,
      },
      this.deviceService.extractDeviceMeta(req),
    );

    const accessToken = accessTokenService.sign(
      this.buildAccessTokenPayload(user, roles, permissions, session.id),
    );

    await this.repository.updateLastLogin(user.id, req.ip);

    await this.repository.logLoginAttempt({
      userId: user.id,
      email: user.email,
      success: true,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      reason: 'success',
    });

    await emitUserLoggedIn(user.id, session.id, {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        username: user.username,
        status: user.status,
        kycStatus: user.kyc_status,
        emailVerified: Boolean(user.email_verified_at),
        phoneVerified: Boolean(user.phone_verified_at),
      },
      roles,
      permissions,
      accessToken,
      refreshToken,
      sessionId: session.id,
      expiresAt: session.expires_at,
    };
  }

  async verifyTwoFactor(challengeToken, code, req) {
    let payload;
    try {
      payload = accessTokenService.verify(challengeToken);
    } catch {
      throw new InvalidCredentialsError('Two-factor challenge token is invalid or expired');
    }

    if (payload.purpose !== '2fa_challenge') {
      throw new InvalidCredentialsError('Two-factor challenge token is invalid');
    }

    const user = await this.repository.findUserById(payload.sub);
    if (!user) {
      throw new InvalidCredentialsError();
    }

    const twoFactor = await this.repository.findTwoFactorByUserId(user.id);
    if (!twoFactor || twoFactor.enabled !== true) {
      throw new InvalidCredentialsError('Two-factor authentication is not enabled');
    }

    const { TwoFactorService } = await import('./two-factor.service.js');
    const service = new TwoFactorService(this.repository);
    await service.verifyCode(user.id, code);

    return this.completeLogin(user, req);
  }
}

module.exports = LoginService;
module.exports.LoginService = LoginService;