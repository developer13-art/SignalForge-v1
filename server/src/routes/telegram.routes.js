/**
 * Telegram Routes
 *
 * Compatibility endpoints for the Telegram connection UI, backed by the
 * session-based Telegram login service.
 *
 * @module signalforge/server/routes/telegram
 */
const { Router } = require('express');
const { authenticationMiddleware } = require('../middleware/authentication.middleware');
const { asyncHandler } = require('../lib/async-handler');
const { successResponse } = require('../lib/response/success.response');
const { telegramLoginService } = require('../modules/signal-sources/telegram/auth/telegram-login.service');
const { telegramSessionService } = require('../modules/signal-sources/telegram/session/telegram-session.service');
const { telegramService } = require('../modules/signal-sources/telegram/telegram.service');

const router = Router();
router.use(authenticationMiddleware());

router.get(
  '/status',
  asyncHandler(async (req, res) => {
    const session = await telegramSessionService.getActiveSession({ userId: req.user.id });
    return successResponse(res, {
      connected: Boolean(session),
      connectionId: session?.id || null,
      telegramUserId: session?.telegramUserId || null,
      telegramUsername: session?.telegramUsername || null,
    });
  }),
);

router.post(
  '/send-code',
  asyncHandler(async (req, res) => {
    const result = await telegramLoginService.sendCode({
      userId: req.user.id,
      phoneNumber: req.body?.phoneNumber || req.body?.phone,
      countryCode: req.body?.countryCode,
    });
    return successResponse(res, result);
  }),
);

router.post(
  '/verify-otp',
  asyncHandler(async (req, res) => {
    const result = await telegramLoginService.signIn({
      userId: req.user.id,
      sessionId: req.body?.sessionId,
      code: req.body?.code,
    });
    return successResponse(res, result);
  }),
);

router.post(
  '/verify-password',
  asyncHandler(async (req, res) => {
    const result = await telegramLoginService.signIn({
      userId: req.user.id,
      sessionId: req.body?.sessionId,
      code: req.body?.code,
      password: req.body?.password,
    });
    return successResponse(res, result);
  }),
);

router.post(
  '/disconnect',
  asyncHandler(async (req, res) => {
    const result = await telegramService.disconnect({ userId: req.user.id });
    return successResponse(res, result);
  }),
);

module.exports = router;