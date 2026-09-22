/**
 * Auth Controller
 *
 * @module signalforge/server/modules/auth/controller
 */

import { AuthService } from './auth.service.js';
import {
  validateRegisterPayload,
  validateLoginPayload,
  validatePasswordResetRequestPayload,
  validatePasswordResetPayload,
  validatePasswordChangePayload,
  validateEmailVerificationPayload,
  validatePhoneVerificationPayload,
  validatePhoneVerifyRequestPayload,
  validateTwoFactorSetupPayload,
  validateTwoFactorVerifyPayload,
  validateTwoFactorDisablePayload,
  validateRefreshTokenPayload,
} from './auth.validator.js';
import { ValidationError } from '../../lib/errors/validation-error.js';
import jwtConfig from '../../config/jwt.config.js';

export class AuthController {
  constructor(service = null) {
    this.service = service || new AuthService();
  }

  setRefreshCookie(res, refreshToken) {
    res.cookie(jwtConfig.refreshToken.cookieName, refreshToken, {
      httpOnly: jwtConfig.refreshToken.httpOnly,
      secure: jwtConfig.refreshToken.secure,
      sameSite: jwtConfig.refreshToken.sameSite,
      path: jwtConfig.refreshToken.path,
      maxAge: jwtConfig.refreshToken.maxAgeMs,
    });
  }

  clearRefreshCookie(res) {
    res.clearCookie(jwtConfig.refreshToken.cookieName, {
      path: jwtConfig.refreshToken.path,
    });
  }

  validateOrThrow(validator, body) {
    const result = validator(body);
    if (!result.valid) {
      throw new ValidationError('Validation failed', {
        code: 'VALIDATION_FAILED',
        details: { errors: result.errors },
      });
    }
  }

  register = async (req, res, next) => {
    try {
      this.validateOrThrow(validateRegisterPayload, req.body);
      const user = await this.service.register(req.body, {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });
      res.status(201).json({
        message: 'Registration successful. Please verify your email.',
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req, res, next) => {
    try {
      this.validateOrThrow(validateLoginPayload, req.body);
      const result = await this.service.login(req.body.email, req.body.password, req);
      this.setRefreshCookie(res, result.refreshToken);
      res.status(200).json({
        user: result.user,
        roles: result.roles,
        permissions: result.permissions,
        accessToken: result.accessToken,
        sessionId: result.sessionId,
        expiresAt: result.expiresAt,
      });
    } catch (error) {
      next(error);
    }
  };

  verifyTwoFactor = async (req, res, next) => {
    try {
      this.validateOrThrow(validateTwoFactorVerifyPayload, req.body);
      const result = await this.service.verifyTwoFactor(
        req.body.challengeToken,
        req.body.code,
        req,
      );
      this.setRefreshCookie(res, result.refreshToken);
      res.status(200).json({
        user: result.user,
        roles: result.roles,
        permissions: result.permissions,
        accessToken: result.accessToken,
        sessionId: result.sessionId,
        expiresAt: result.expiresAt,
      });
    } catch (error) {
      next(error);
    }
  };

  logout = async (req, res, next) => {
    try {
      const sessionId = req.user?.sessionId || null;
      const userId = req.user?.id;
      const result = await this.service.logout(sessionId, userId, {
        ipAddress: req.ip,
      });
      this.clearRefreshCookie(res);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  logoutAll = async (req, res, next) => {
    try {
      const userId = req.user?.id;
      const sessionId = req.user?.sessionId || null;
      const result = await this.service.logoutAllDevices(userId, sessionId, {
        ipAddress: req.ip,
      });
      this.clearRefreshCookie(res);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  refresh = async (req, res, next) => {
    try {
      const refreshToken =
        req.body?.refreshToken || req.cookies?.[jwtConfig.refreshToken.cookieName];
      const result = await this.service.refresh(refreshToken, req);
      this.setRefreshCookie(res, result.refreshToken);
      res.status(200).json({
        accessToken: result.accessToken,
        sessionId: result.sessionId,
        expiresAt: result.expiresAt,
      });
    } catch (error) {
      next(error);
    }
  };

  requestPasswordReset = async (req, res, next) => {
    try {
      this.validateOrThrow(validatePasswordResetRequestPayload, req.body);
      const result = await this.service.requestPasswordReset(req.body.email);
      res.status(200).json({
        message: 'If an account exists for that email, a reset link has been sent.',
        requested: result.requested,
      });
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req, res, next) => {
    try {
      this.validateOrThrow(validatePasswordResetPayload, req.body);
      const result = await this.service.completePasswordReset(
        req.body.token,
        req.body.password,
      );
      res.status(200).json({
        message: 'Password has been reset successfully.',
        userId: result.userId,
      });
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (req, res, next) => {
    try {
      this.validateOrThrow(validatePasswordChangePayload, req.body);
      const result = await this.service.changePassword(
        req.user.id,
        req.body.currentPassword,
        req.body.newPassword,
        req.user.sessionId,
      );
      res.status(200).json({
        message: 'Password changed successfully.',
        changed: result.changed,
      });
    } catch (error) {
      next(error);
    }
  };

  requestEmailVerification = async (req, res, next) => {
    try {
      const result = await this.service.requestEmailVerification(
        req.user.id,
        req.user.email,
      );
      res.status(200).json({
        message: 'Verification email sent.',
        expiresAt: result.expiresAt,
      });
    } catch (error) {
      next(error);
    }
  };

  verifyEmail = async (req, res, next) => {
    try {
      this.validateOrThrow(validateEmailVerificationPayload, req.body);
      const result = await this.service.verifyEmail(req.body.token);
      res.status(200).json({
        message: 'Email verified successfully.',
        verified: result.verified,
      });
    } catch (error) {
      next(error);
    }
  };

  requestPhoneVerification = async (req, res, next) => {
    try {
      this.validateOrThrow(validatePhoneVerifyRequestPayload, req.body);
      const result = await this.service.requestPhoneVerification(
        req.user.id,
        req.body.phone,
      );
      res.status(200).json({
        message: 'Verification code sent.',
        expiresAt: result.expiresAt,
      });
    } catch (error) {
      next(error);
    }
  };

  verifyPhone = async (req, res, next) => {
    try {
      this.validateOrThrow(validatePhoneVerificationPayload, req.body);
      const result = await this.service.verifyPhone(req.user.id, req.body.code);
      res.status(200).json({
        message: 'Phone verified successfully.',
        verified: result.verified,
      });
    } catch (error) {
      next(error);
    }
  };

  twoFactorSetup = async (req, res, next) => {
    try {
      this.validateOrThrow(validateTwoFactorSetupPayload, req.body);
      const result = await this.service.startTwoFactorSetup(
        req.user.id,
        req.user.email,
        req.body.method || 'TOTP',
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  twoFactorConfirm = async (req, res, next) => {
    try {
      this.validateOrThrow(validateTwoFactorVerifyPayload, req.body);
      const result = await this.service.confirmTwoFactorSetup(
        req.user.id,
        req.body.code,
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  twoFactorDisable = async (req, res, next) => {
    try {
      this.validateOrThrow(validateTwoFactorDisablePayload, req.body);
      const result = await this.service.disableTwoFactor(
        req.user.id,
        req.body.password,
        req.body.code,
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  twoFactorStatus = async (req, res, next) => {
    try {
      const result = await this.service.getTwoFactorStatus(req.user.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  regenerateBackupCodes = async (req, res, next) => {
    try {
      this.validateOrThrow(validateTwoFactorVerifyPayload, req.body);
      const result = await this.service.regenerateBackupCodes(
        req.user.id,
        req.body.code,
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  listSessions = async (req, res, next) => {
    try {
      const sessions = await this.service.listSessions(req.user.id);
      res.status(200).json({ sessions });
    } catch (error) {
      next(error);
    }
  };

  revokeSession = async (req, res, next) => {
    try {
      const result = await this.service.revokeSession(
        req.params.sessionId,
        req.user.id,
        'user_action',
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  listDevices = async (req, res, next) => {
    try {
      const devices = await this.service.listDevices(req.user.id);
      res.status(200).json({ devices });
    } catch (error) {
      next(error);
    }
  };

  accountRecoveryRequest = async (req, res, next) => {
    try {
      this.validateOrThrow(validatePasswordResetRequestPayload, req.body);
      const result = await this.service.requestAccountRecovery(req.body.email);
      res.status(200).json({ requested: result.requested });
    } catch (error) {
      next(error);
    }
  };

  accountRecoveryComplete = async (req, res, next) => {
    try {
      this.validateOrThrow(validatePasswordResetPayload, req.body);
      const result = await this.service.completeAccountRecovery(
        req.body.token,
        req.body.password,
      );
      res.status(200).json({
        message: 'Account recovered successfully.',
        userId: result.userId,
      });
    } catch (error) {
      next(error);
    }
  };

  socialLogin = async (req, res, next) => {
    try {
      const { provider, token } = req.body;
      const result = await this.service.socialLogin(provider, token, req);
      this.setRefreshCookie(res, result.refreshToken);
      res.status(200).json({
        user: result.user,
        roles: result.roles,
        permissions: result.permissions,
        accessToken: result.accessToken,
        sessionId: result.sessionId,
        expiresAt: result.expiresAt,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default AuthController;