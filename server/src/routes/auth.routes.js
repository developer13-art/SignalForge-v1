/**
 * Authentication Routes
 *
 * Mounts every authentication endpoint on top of the AuthController.
 * The controller delegates to the AuthService, which dispatches to
 * the individual service modules (register, login, refresh, and so
 * on) and returns canonical JSON responses.
 *
 * The AuthController is constructed lazily on the first request so
 * that the database and other subsystems have been initialized by
 * the bootstrap sequence before any controller is instantiated.
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

// The controller is constructed the first time a request reaches this
// router. By that point, bootstrap has completed and every subsystem
// the controller depends on is available.
let controllerInstance = null;

function controller() {
  if (!controllerInstance) {
    controllerInstance = new AuthController();
  }
  return controllerInstance;
}

function handle(method) {
  return (req, res, next) => controller()[method](req, res, next);
}

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

router.post('/register', authRateLimiter, handle('register'));
router.post('/login', authRateLimiter, handle('login'));
router.post('/refresh', handle('refresh'));
router.post('/forgot-password', sensitiveRateLimiter, handle('requestPasswordReset'));
router.post('/reset-password', sensitiveRateLimiter, handle('resetPassword'));
router.post('/verify-email', handle('verifyEmail'));
router.post('/2fa/verify', authRateLimiter, handle('verifyTwoFactor'));
router.post('/account-recovery', sensitiveRateLimiter, handle('accountRecoveryRequest'));
router.post('/account-recovery/complete', sensitiveRateLimiter, handle('accountRecoveryComplete'));
router.post('/social', handle('socialLogin'));

// -------------------- Authenticated --------------------

router.post('/logout', authenticationMiddleware, handle('logout'));
router.post('/logout-all', authenticationMiddleware, handle('logoutAll'));
router.post('/change-password', authenticationMiddleware, handle('changePassword'));

router.post(
  '/verify-email/request',
  authenticationMiddleware,
  handle('requestEmailVerification'),
);

router.post(
  '/verify-phone/request',
  authenticationMiddleware,
  handle('requestPhoneVerification'),
);
router.post('/verify-phone', authenticationMiddleware, handle('verifyPhone'));

router.post('/2fa/setup', authenticationMiddleware, handle('twoFactorSetup'));
router.post('/2fa/confirm', authenticationMiddleware, handle('twoFactorConfirm'));
router.post('/2fa/disable', authenticationMiddleware, handle('twoFactorDisable'));
router.get('/2fa/status', authenticationMiddleware, handle('twoFactorStatus'));
router.post(
  '/2fa/backup-codes',
  authenticationMiddleware,
  handle('regenerateBackupCodes'),
);

router.get('/sessions', authenticationMiddleware, handle('listSessions'));
router.delete(
  '/sessions/:sessionId',
  authenticationMiddleware,
  handle('revokeSession'),
);

router.get('/devices', authenticationMiddleware, handle('listDevices'));

module.exports = router;