/**
 * Authentication Routes
 *
 * Mounts every authentication endpoint on top of the AuthController.
 * The controller delegates to the AuthService, which dispatches to
 * the individual service modules (register, login, refresh, and so
 * on) and returns canonical JSON responses.
 *
 * Public (unauthenticated) endpoints:
 *   POST   /api/auth/register
 *   POST   /api/auth/login
 *   POST   /api/auth/refresh
 *   POST   /api/auth/forgot-password
 *   POST   /api/auth/reset-password
 *   POST   /api/auth/verify-email
 *   POST   /api/auth/2fa/verify
 *   POST   /api/auth/account-recovery
 *
 * Authenticated endpoints (require a valid access token):
 *   POST   /api/auth/logout
 *   POST   /api/auth/logout-all
 *   POST   /api/auth/change-password
 *   POST   /api/auth/verify-email/request
 *   POST   /api/auth/verify-phone/request
 *   POST   /api/auth/verify-phone
 *   POST   /api/auth/2fa/setup
 *   POST   /api/auth/2fa/confirm
 *   POST   /api/auth/2fa/disable
 *   GET    /api/auth/2fa/status
 *   POST   /api/auth/2fa/backup-codes
 *   GET    /api/auth/sessions
 *   DELETE /api/auth/sessions/:sessionId
 *   GET    /api/auth/devices
 *
 * @module signalforge/server/routes/auth
 */

const { Router } = require('express');

const { AuthController } = require('../modules/auth/auth.controller.js');
const { authenticationMiddleware } = require('../middleware/authentication.middleware.js');
const { rateLimitMiddleware } = require('../middleware/rate-limit.middleware.js');

const router = Router();
const controller = new AuthController();

const authRateLimiter = rateLimitMiddleware({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: 'Too many authentication attempts. Please try again later.',
});

const sensitiveRateLimiter = rateLimitMiddleware({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many requests. Please try again later.',
});

// -------------------- Public (unauthenticated) --------------------

router.post('/register', authRateLimiter, controller.register);
router.post('/login', authRateLimiter, controller.login);
router.post('/refresh', controller.refresh);
router.post('/forgot-password', sensitiveRateLimiter, controller.requestPasswordReset);
router.post('/reset-password', sensitiveRateLimiter, controller.resetPassword);
router.post('/verify-email', controller.verifyEmail);
router.post('/2fa/verify', authRateLimiter, controller.verifyTwoFactor);
router.post('/account-recovery', sensitiveRateLimiter, controller.accountRecoveryRequest);
router.post('/account-recovery/complete', sensitiveRateLimiter, controller.accountRecoveryComplete);
router.post('/social', controller.socialLogin);

// -------------------- Authenticated --------------------

router.post('/logout', authenticationMiddleware, controller.logout);
router.post('/logout-all', authenticationMiddleware, controller.logoutAll);
router.post('/change-password', authenticationMiddleware, controller.changePassword);

router.post(
  '/verify-email/request',
  authenticationMiddleware,
  controller.requestEmailVerification,
);

router.post(
  '/verify-phone/request',
  authenticationMiddleware,
  controller.requestPhoneVerification,
);
router.post('/verify-phone', authenticationMiddleware, controller.verifyPhone);

router.post('/2fa/setup', authenticationMiddleware, controller.twoFactorSetup);
router.post('/2fa/confirm', authenticationMiddleware, controller.twoFactorConfirm);
router.post('/2fa/disable', authenticationMiddleware, controller.twoFactorDisable);
router.get('/2fa/status', authenticationMiddleware, controller.twoFactorStatus);
router.post(
  '/2fa/backup-codes',
  authenticationMiddleware,
  controller.regenerateBackupCodes,
);

router.get('/sessions', authenticationMiddleware, controller.listSessions);
router.delete(
  '/sessions/:sessionId',
  authenticationMiddleware,
  controller.revokeSession,
);

router.get('/devices', authenticationMiddleware, controller.listDevices);

module.exports = router;