/**
 * Device Routes (User Module)
 *
 * @module signalforge/server/modules/users/devices/routes
 */
const { Router } = require('express');
const { DeviceController } = require('./device.controller.js');
const { authenticationMiddleware } = require('../../../middleware/authentication.middleware.js');
function buildDeviceRouter(controller = null) {
  const router = Router();
  const deviceController = controller || new DeviceController();

  router.use(authenticationMiddleware());

  router.get('/', deviceController.listDevices);
  router.delete('/:deviceId', deviceController.removeDevice);

  return router;
}
module.exports = buildDeviceRouter;
module.exports.buildDeviceRouter = buildDeviceRouter;
