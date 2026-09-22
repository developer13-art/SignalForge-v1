/**
 * Auth Routes (module-level)
 *
 * Note: The application's route mounting is defined in
 * `server/src/routes/auth.routes.js`. This module-level version wires
 * the AuthController directly so that route handlers and services
 * stay colocated inside the auth module.
 *
 * The app-level router in `routes/auth.routes.js` is a placeholder
 * and should be replaced during integration with this router.
 *
 * @module signalforge/server/modules/auth/routes
 */

import { Router } from 'express';

import { AuthController } from './auth.controller.js';
import { authenticationMiddleware } from '../../middleware/authentication.middleware.js';
import { rateLimitMiddleware } from '../../middleware/rate-limit.middleware.js';
import rateLimit from 'express-rate-limit';
import rateLimitConfig from '../../config/rate-limit.config.js';

function makeLimiter(config, message) {
  return rateLimit({
    windowMs: config.windowMs,
    max: config.max,
    message: { error: { code: 'RATE_LIMIT_EXCEEDED', message } },
    standardHeaders: true,
    legacyHeaders: false,
  });
}

export function buildAuthRouter(controller = null) {
  const router = Router();
  const authController = controller || new AuthController();

  const loginLimiter = makeLimiter(
    rateLimitConfig.auth.login,
    rateLimitConfig.auth.login.message,
  );
  const registerLimiter = makeLimiter(
    rateLimitConfig.auth.register,
    rateLimitConfig.auth.register.message,
  );
  const resetLimiter = makeLimiter(
    rateLimitConfig.auth.passwordReset,
    rateLimitConfig.auth.passwordReset.message,
  );
  const twoFactorLimiter = makeLimiter(
    rateLimitConfig.auth.twoFactor,
    'Too many two-factor attempts, please try again later.',
  );

  router.post('/register', registerLimiter, authController.register);
  router.post('/login', loginLimiter, authController.login);
  router.post('/login/verify-2fa', twoFactorLimiter, authController.verifyTwoFactor);
  router.post('/refresh', authController.refresh);
  router.post('/logout', authenticationMiddleware(), authController.logout);
  router.post('/logout-all', authenticationMiddleware(), authController.logoutAll);

  router.post('/forgot-password', resetLimiter, authController.requestPasswordReset);
  router.post('/reset-password', resetLimiter, authController.resetPassword);
  router.post('/change-password', authenticationMiddleware(), authController.changePassword);

  router.post('/verify-email', authController.verifyEmail);
  router.post('/verify-email/request', authenticationMiddleware(), authController.requestEmailVerification);
  router.post('/verify-phone', authenticationMiddleware(), authController.verifyPhone);
  router.post('/verify-phone/request', authenticationMiddleware(), authController.requestPhoneVerification);

  router.get('/2fa/status', authenticationMiddleware(), authController.twoFactorStatus);
  router.post('/2fa/setup', authenticationMiddleware(), authController.twoFactorSetup);
  router.post('/2fa/confirm', twoFactorLimiter, authenticationMiddleware(), authController.twoFactorConfirm);
  router.post('/2fa/disable', twoFactorLimiter, authenticationMiddleware(), authController.twoFactorDisable);
  router.post('/2fa/backup-codes', twoFactorLimiter, authenticationMiddleware(), authController.regenerateBackupCodes);

  router.get('/sessions', authenticationMiddleware(), authController.listSessions);
  router.delete('/sessions/:sessionId', authenticationMiddleware(), authController.revokeSession);
  router.get('/devices', authenticationMiddleware(), authController.listDevices);

  router.post('/account-recovery/request', resetLimiter, authController.accountRecoveryRequest);
  router.post('/account-recovery/complete', resetLimiter, authController.accountRecoveryComplete);

  router.post('/social/:provider', authController.socialLogin);

  return router;
}

const router = buildAuthRouter();

export default router;