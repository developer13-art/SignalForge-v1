'use strict';

/**
 * User Routes
 *
 * Thin router for the current user's endpoints. It delegates every
 * request to the real UserController, which owns all business logic
 * and persistence. The controller is instantiated lazily — once, on
 * the first request — so this file can be required before the
 * database is initialized.
 *
 * @module signalforge/server/routes/user
 */

const { Router } = require('express');

const router = Router();
const { authenticationMiddleware } = require('../middleware/authentication.middleware');
router.use(authenticationMiddleware());

let controllerInstance = null;

function getController() {
  if (controllerInstance) {
    return controllerInstance;
  }
  // Lazy require + instantiate. Runs on first request, after the
  // bootstrap has finished initializing the database.
  const { UserController } = require('../modules/users/user.controller');
  controllerInstance = new UserController();
  return controllerInstance;
}

function wrap(handlerName) {
  return (req, res, next) => {
    try {
      const controller = getController();
      const handler = controller[handlerName];
      if (typeof handler !== 'function') {
        return res.status(500).json({
          error: {
            code: 'HANDLER_NOT_FOUND',
            message: `Handler ${handlerName} is not defined on UserController`,
          },
        });
      }
      return handler.call(controller, req, res, next);
    } catch (error) {
      return next(error);
    }
  };
}

router.get('/me', wrap('getMe'));
router.patch('/me', wrap('updateMe'));
router.delete('/me', wrap('deleteMe'));
router.post('/me/deactivate', wrap('deactivateMe'));
router.post('/me/reactivate', wrap('reactivateMe'));

router.get('/me/profile', wrap('getProfile'));
router.patch('/me/profile', wrap('updateProfile'));

router.get('/me/preferences', wrap('getPreferences'));
router.patch('/me/preferences', wrap('updatePreferences'));

// Placeholder endpoints — no controller dependency yet.
router.get('/me/devices', (req, res) => res.status(200).json({ devices: [] }));
router.delete('/me/devices/:deviceId', (req, res) =>
  res.status(202).json({ message: 'Revoke device endpoint placeholder' }),
);

router.get('/me/api-keys', (req, res) => res.status(200).json({ apiKeys: [] }));
router.post('/me/api-keys', (req, res) =>
  res.status(202).json({ message: 'Create API key endpoint placeholder' }),
);
router.delete('/me/api-keys/:keyId', (req, res) =>
  res.status(202).json({ message: 'Revoke API key endpoint placeholder' }),
);

module.exports = router;